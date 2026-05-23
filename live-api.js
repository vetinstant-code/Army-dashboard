/**
 * Live EC2 API → Health Records (date-filtered), temperatures, ward register.
 */
(function (global) {
  const WARD_REGISTER_MAY_2026 = [
    { regt: "7806", name: "Rustem", disease: "Swelling L/H", admission: "02/05/26", discharge: "08/05/26", active: false },
    { regt: "0958", name: "—", disease: "Swelling L/Hock", admission: "05/05/26", discharge: "11/05/26", active: false },
    { regt: "0591", name: "—", disease: "Wd Lac Lt shoulder", admission: "10/05/26", discharge: "15/05/26", active: false },
    { regt: "7471", name: "Tejas", disease: "Swelling L/H", admission: "13/05/26", discharge: "19/05/26", active: false },
    { regt: "25126", name: "Gladiator", disease: "Dermatitis", admission: "18/05/26", discharge: "24/05/26", active: false },
    { regt: "7471", name: "Tejas", disease: "Dermatitis", admission: "23/05/26", discharge: "", active: true },
  ];

  const WARD_BY_NAME = {};
  for (const row of WARD_REGISTER_MAY_2026) {
    if (row.name && row.name !== "—") {
      WARD_BY_NAME[row.name.toLowerCase()] = row.regt;
    }
  }

  const HORSE_TEMP = { min: 37.2, max: 38.6 };

  const istDateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const istTimeFormatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const store = {
    client: null,
    pets: [],
    loading: false,
    error: null,
    selectedDate: null,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function todayIso() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function getSelectedDate() {
    const input = $("health-records-date");
    const v = (input?.value || store.selectedDate || todayIso()).trim();
    store.selectedDate = v;
    if (input && input.value !== v) input.value = v;
    return v;
  }

  function formatDisplayDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function normalizeTemperature(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload.filter((r) => r && typeof r === "object");
    if (typeof payload === "object") {
      for (const key of ["readings", "temperature_readings", "data", "results"]) {
        const blob = payload[key];
        if (Array.isArray(blob)) return blob.filter((r) => r && typeof r === "object");
      }
    }
    return [];
  }

  function petId(pet) {
    return String(pet.id ?? pet.pet_id ?? "").trim();
  }

  function petName(pet) {
    return String(pet.name ?? pet.pet_name ?? "Unknown").trim() || "Unknown";
  }

  function petRmtNo(pet) {
    for (const key of ["rmt_no", "rmt", "regt", "regt_no", "registration_number", "registration_no"]) {
      const v = String(pet[key] ?? "").trim();
      if (v) return v;
    }
    const name = petName(pet);
    const ward = WARD_BY_NAME[name.toLowerCase()];
    if (ward) return ward;
    if (/^RMT\d*$/i.test(name)) return name.toUpperCase();
    return "—";
  }

  function displayName(pet) {
    const name = petName(pet);
    if (/^RMT\d*$/i.test(name)) return "—";
    return name;
  }

  function sessionStartedDateIst(session) {
    const raw = String(session?.started_at ?? session?.created_at ?? "").trim();
    if (!raw) return null;
    try {
      const parsed = new Date(raw.replace("Z", "+00:00"));
      if (Number.isNaN(parsed.getTime())) return null;
      return istDateFormatter.format(parsed);
    } catch {
      return null;
    }
  }

  function sessionTimeIst(session) {
    const raw = String(session?.started_at ?? session?.created_at ?? "").trim();
    if (!raw) return "";
    try {
      const parsed = new Date(raw.replace("Z", "+00:00"));
      if (Number.isNaN(parsed.getTime())) return "";
      return istTimeFormatter.format(parsed);
    } catch {
      return "";
    }
  }

  function sessionsForDate(allSessions, dateIso) {
    return (allSessions || [])
      .filter((s) => sessionStartedDateIst(s) === dateIso)
      .sort((a, b) => {
        const ta = new Date(a.started_at || a.created_at || 0).getTime();
        const tb = new Date(b.started_at || b.created_at || 0).getTime();
        return ta - tb;
      });
  }

  function sessionNumbersLabel(sessionsOnDate) {
    if (!sessionsOnDate.length) return "—";
    return sessionsOnDate.map((_, i) => i + 1).join(" ");
  }

  function formatTemp(c) {
    const n = Number(c);
    if (!Number.isFinite(n) || n <= 0) return "—";
    return `${n.toFixed(1)}°C`;
  }

  function latestRefTemp(readings) {
    const refs = readings.filter((r) =>
      String(r.sensor_type || r.type || "").toLowerCase().includes("reference")
    );
    const vals = refs.map((r) => Number(r.temperature_value)).filter((n) => Number.isFinite(n) && n > 0);
    if (vals.length) return vals[vals.length - 1];
    const any = readings.map((r) => Number(r.temperature_value)).filter((n) => Number.isFinite(n) && n > 0);
    return any.length ? any[any.length - 1] : null;
  }

  function vitalsStatus(celsius, taken) {
    if (!taken) return { label: "Not taken", class: "muted" };
    const n = Number(celsius);
    if (!Number.isFinite(n) || n <= 0) return { label: "No reading", class: "" };
    const { min, max } = HORSE_TEMP;
    if (n > max + 0.8) return { label: "Critical", class: "high" };
    if (n > max) return { label: "Elevated", class: "warn" };
    if (n < min) return { label: "Low", class: "warn" };
    return { label: "Stable", class: "" };
  }

  function badgeHtml(label, cls) {
    if (label === "Not taken") return `<span class="badge muted">Not taken</span>`;
    if (label === "Critical" || label === "High Risk") return `<span class="badge high">${label}</span>`;
    if (label === "Elevated" || label === "At Risk") return `<span class="badge warn">${label}</span>`;
    if (label === "No reading") return `<span class="badge muted">No reading</span>`;
    return `<span class="badge">${label}</span>`;
  }

  async function ensureClient() {
    if (store.client) return store.client;
    const session = global.VetAuth?.getSession?.();
    if (!session) throw new Error("Not signed in. Use ARMY login.");
    const cfg = { ...global.API_CONFIG, deviceId: session.deviceId || "ARMY" };
    const client = new global.VetApiClient(cfg);
    await client.login(session.deviceId, session.password);
    store.client = client;
    return client;
  }

  function renderWardRegister() {
    const body = $("ward-register-body");
    if (!body) return;
    body.innerHTML = WARD_REGISTER_MAY_2026.map((row) => {
      const status = row.active ? "Active" : "Discharged";
      const statusClass = row.active ? "high" : "";
      const name = row.name === "—" ? `<em>${row.regt}</em>` : row.name;
      return `<tr class="${row.active ? "ward-row-active" : ""}">
        <td>${row.regt}</td>
        <td>${name}</td>
        <td>${row.disease}</td>
        <td>${row.admission}</td>
        <td>${row.discharge || "—"}</td>
        <td>${badgeHtml(status, statusClass)}</td>
      </tr>`;
    }).join("");
  }

  async function loadSessionsForPet(pet) {
    const id = petId(pet);
    if (!id || pet._sessions) return pet;
    try {
      const sessRaw = await store.client.examSessions(id);
      pet._sessions = global.VetApiNormalize.normalizeSessions(sessRaw);
    } catch (e) {
      pet._sessions = [];
      pet._apiError = e.message || String(e);
    }
    return pet;
  }

  async function applyDateToPet(pet, dateIso) {
    await loadSessionsForPet(pet);
    const onDate = sessionsForDate(pet._sessions, dateIso);
    pet._sessionsOnDate = onDate;
    pet._sessionLabel = sessionNumbersLabel(onDate);
    pet._takenOnDate = onDate.length > 0;

    if (!onDate.length) {
      pet._temperatures = [];
      pet._latestTempC = null;
      pet._detailSessionId = null;
      return pet;
    }

    const latest = onDate[onDate.length - 1];
    const sid = String(latest.id ?? latest.exam_session_id ?? "").trim();
    pet._detailSessionId = sid;
    try {
      const tempRaw = await store.client.petTemperatureBySession(petId(pet), sid);
      pet._temperatures = normalizeTemperature(tempRaw);
      pet._latestTempC = latestRefTemp(pet._temperatures);
    } catch (e) {
      pet._temperatures = [];
      pet._latestTempC = null;
      pet._apiError = e.message || String(e);
    }
    return pet;
  }

  function renderHealthRecordsTable() {
    const body = $("health-records-body");
    const status = $("health-records-status");
    if (!body) return;

    const dateIso = getSelectedDate();

    if (store.error) {
      if (status) status.textContent = store.error;
      body.innerHTML = `<tr><td colspan="6">Could not load data. Check ngrok, CORS, and password.</td></tr>`;
      return;
    }

    if (!store.pets.length) {
      if (status) status.textContent = "No horses on this device.";
      body.innerHTML = `<tr><td colspan="6">No horses returned from API.</td></tr>`;
      return;
    }

    let taken = 0;
    let notTaken = 0;
    for (const p of store.pets) {
      if (p._takenOnDate) taken++;
      else notTaken++;
    }
    if (status) {
      status.textContent = `${formatDisplayDate(dateIso)} · ${taken} taken · ${notTaken} not taken`;
    }

    body.innerHTML = store.pets
      .map((pet) => {
        const id = petId(pet);
        const rmt = petRmtNo(pet);
        const name = displayName(pet);
        const sessions = pet._sessionLabel ?? "—";
        const temp = pet._takenOnDate ? formatTemp(pet._latestTempC) : "—";
        const vs = vitalsStatus(pet._latestTempC, pet._takenOnDate);
        const err = pet._apiError ? ` <small title="${pet._apiError}">⚠</small>` : "";
        const rowClass = pet._takenOnDate ? "" : "health-row-not-taken";
        return `<tr class="health-pet-row ${rowClass}" data-pet-id="${id}">
          <td>${rmt}</td>
          <td><strong>${name}</strong>${err}</td>
          <td>${sessions}</td>
          <td>${temp}</td>
          <td>${badgeHtml(vs.label, vs.class)}</td>
          <td><button type="button" class="mini health-view-btn" data-pet-id="${id}" ${pet._takenOnDate ? "" : "disabled"}>Temps</button></td>
        </tr>`;
      })
      .join("");

    body.querySelectorAll(".health-view-btn:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", () => showPetDetail(btn.dataset.petId));
    });
  }

  function setHorseKpiLabels() {
    const totalLabel = $("kpi-total-label");
    const riskLabel = $("kpi-risk-label");
    const heatLabel = $("kpi-heat-label");
    if (totalLabel) totalLabel.textContent = "Total Horses";
    if (riskLabel) riskLabel.textContent = "Not taken";
    if (heatLabel) heatLabel.textContent = "Estrus Alerts";
  }

  function setTotalHorseCount(count) {
    const el = $("kpi-total-count");
    if (el) el.textContent = String(count);
    setHorseKpiLabels();
  }

  function renderTempGrid(readings, gridEl) {
    const grid = gridEl || $("health-detail-temps");
    if (!grid) return;
    if (!readings?.length) {
      grid.innerHTML = "<p class=\"health-temp-empty\">No temperature readings for this session.</p>";
      return;
    }

    const irItems = readings.filter((r) => /ir|ear/i.test(String(r.sensor_type || r.type || "")));
    const refItems = readings.filter((r) =>
      /reference|thermometer/i.test(String(r.sensor_type || r.type || ""))
    );
    const otherItems = readings.filter((r) => {
      const s = String(r.sensor_type || r.type || "");
      return !/ir|ear/i.test(s) && !/reference|thermometer/i.test(s);
    });

    let html = "";
    if (irItems.length) {
      html += `<section class="health-temp-section">
        <h4 class="health-temp-section-title">Infrared (ear)</h4>
        <div class="health-temp-grid-inner">${irItems.map(renderTempCard).join("")}</div>
      </section>`;
    }
    if (refItems.length) {
      html += `<section class="health-temp-section">
        <h4 class="health-temp-section-title">Reference thermometer</h4>
        <div class="health-temp-grid-inner">${refItems.map(renderTempCard).join("")}</div>
      </section>`;
    }
    if (otherItems.length) {
      html += `<section class="health-temp-section">
        <h4 class="health-temp-section-title">Other readings</h4>
        <div class="health-temp-grid-inner">${otherItems.map(renderTempCard).join("")}</div>
      </section>`;
    }

    grid.innerHTML = html || "<p class=\"health-temp-empty\">No readings</p>";
  }

  function renderTempCard(r) {
    const sensor = String(r.sensor_type || r.type || "reading").replace(/_/g, " ");
    const num = r.reading_number != null ? `#${r.reading_number}` : "";
    const val = Number(r.temperature_value);
    const level = val > 38.6 ? "high" : val > 0 && val < 37.2 ? "low" : "ok";
    return `<article class="health-temp-card health-temp-${level}">
      <span class="health-temp-card-label">${sensor} ${num}</span>
      <strong>${formatTemp(r.temperature_value)}</strong>
    </article>`;
  }

  async function loadSessionTemperatures(pet, session) {
    const sid = String(session?.id ?? session?.exam_session_id ?? "").trim();
    if (!sid) return [];
    if (!pet._tempCache) pet._tempCache = {};
    if (pet._tempCache[sid]) return pet._tempCache[sid];
    const raw = await store.client.petTemperatureBySession(petId(pet), sid);
    const readings = normalizeTemperature(raw);
    pet._tempCache[sid] = readings;
    return readings;
  }

  async function selectDetailSession(pet, session, index, sessionsOnDate) {
    const picker = $("health-session-picker");
    const dateIso = getSelectedDate();
    const time = sessionTimeIst(session);
    const meta = $("health-detail-meta");
    if (meta) {
      meta.textContent = `RMT No. ${petRmtNo(pet)} · ${formatDisplayDate(dateIso)} · Session ${index + 1} of ${sessionsOnDate.length}${time ? ` · ${time}` : ""}`;
    }
    picker?.querySelectorAll(".health-session-btn").forEach((btn, i) => {
      btn.classList.toggle("active", i === index);
      btn.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    const grid = $("health-detail-temps");
    if (grid) grid.innerHTML = "<p class=\"health-loading\">Loading temperatures…</p>";
    try {
      const readings = await loadSessionTemperatures(pet, session);
      renderTempGrid(readings, grid);
    } catch (e) {
      if (grid) grid.innerHTML = `<p>Could not load temperatures: ${e.message || e}</p>`;
    }
  }

  async function showPetDetail(id) {
    const pet = store.pets.find((p) => petId(p) === id);
    const panel = $("health-detail-panel");
    const picker = $("health-session-picker");
    if (!pet || !panel) return;

    const dateIso = getSelectedDate();
    panel.hidden = false;
    pet._tempCache = {};

    const titleName = displayName(pet) !== "—" ? displayName(pet) : petName(pet);
    $("health-detail-title").textContent = `${titleName} — temperature`;

    const sessionsOnDate = pet._sessionsOnDate || [];

    if (!pet._takenOnDate || !sessionsOnDate.length) {
      if (picker) picker.innerHTML = "";
      $("health-detail-meta").textContent = `RMT No. ${petRmtNo(pet)} · ${formatDisplayDate(dateIso)}`;
      renderTempGrid([], $("health-detail-temps"));
      const grid = $("health-detail-temps");
      if (grid) grid.innerHTML = "<p>Not taken on this date.</p>";
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    if (picker) {
      picker.innerHTML = `<div class="health-session-picker-inner">${sessionsOnDate
        .map((session, i) => {
          const time = sessionTimeIst(session);
          return `<button type="button" class="health-session-btn${i === 0 ? " active" : ""}" role="tab" aria-selected="${i === 0 ? "true" : "false"}" data-session-index="${i}">
            <span class="health-session-num">Session ${i + 1}</span>
            ${time ? `<span class="health-session-time">${time}</span>` : ""}
          </button>`;
        })
        .join("")}</div>`;

      picker.querySelectorAll(".health-session-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.sessionIndex);
          selectDetailSession(pet, sessionsOnDate[idx], idx, sessionsOnDate);
        });
      });
    }

    await selectDetailSession(pet, sessionsOnDate[0], 0, sessionsOnDate);
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function applyDateFilter(dateIso) {
    store.selectedDate = dateIso;
    const status = $("health-records-status");
    for (let i = 0; i < store.pets.length; i++) {
      if (status) status.textContent = `Loading ${formatDisplayDate(dateIso)}… ${i + 1}/${store.pets.length}`;
      await applyDateToPet(store.pets[i], dateIso);
    }
    renderHealthRecordsTable();
    updateDashboardKpis();
  }

  async function loadAllPets() {
    if (store.loading) return;
    store.loading = true;
    store.error = null;
    const status = $("health-records-status");
    if (status) status.textContent = "Connecting…";

    const kpiTotal = $("kpi-total-count");
    if (kpiTotal) kpiTotal.textContent = "…";

    try {
      const client = await ensureClient();
      const raw = await client.listPets();
      store.pets = global.VetApiNormalize.normalizePets(raw).map((p) => ({ ...p }));
      setTotalHorseCount(store.pets.length);
      await applyDateFilter(getSelectedDate());
    } catch (e) {
      store.error = e.message || String(e);
      console.error("Live API:", e);
      if (kpiTotal) kpiTotal.textContent = "—";
      renderHealthRecordsTable();
    } finally {
      store.loading = false;
    }
  }

  function updateDashboardKpis() {
    if (!store.pets.length) return;

    const total = store.pets.length;
    setTotalHorseCount(total);

    let healthy = 0;
    let notTaken = 0;
    let sick = 0;
    let taken = 0;

    for (const p of store.pets) {
      if (!p._takenOnDate) {
        notTaken++;
        continue;
      }
      taken++;
      const vs = vitalsStatus(p._latestTempC, true);
      if (vs.label === "Critical" || vs.label === "Elevated") sick++;
      else if (vs.label === "Stable") healthy++;
    }

    const elHealthy = $("kpi-healthy-count");
    const elRisk = $("kpi-risk-count");
    const elSick = $("kpi-sick-count");
    if (elHealthy) elHealthy.textContent = String(healthy);
    if (elRisk) elRisk.textContent = String(notTaken);
    if (elSick) elSick.textContent = String(sick);

    const dateIso = getSelectedDate();
    const sub = $("health-records-status");
    if (sub) {
      sub.textContent = `${formatDisplayDate(dateIso)} · ${taken} taken · ${notTaken} not taken · ${total} horses registered`;
    }
  }

  function onCheckupScreen() {
    renderWardRegister();
    if (!store.pets.length && !store.loading) loadAllPets();
    else renderHealthRecordsTable();
  }

  function bindUi() {
    renderWardRegister();
    const dateInput = $("health-records-date");
    if (dateInput) {
      if (!dateInput.value) {
        dateInput.value = todayIso();
        store.selectedDate = dateInput.value;
      }
      dateInput.addEventListener("change", () => {
        if (store.pets.length) applyDateFilter(dateInput.value);
        else loadAllPets();
      });
    }

    $("api-refresh-btn")?.addEventListener("click", () => loadAllPets());

    document.getElementById("sidebar-nav")?.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-screen]");
      if (link?.dataset.screen === "checkup") onCheckupScreen();
    });

    if (location.hash === "#checkup") onCheckupScreen();
  }

  function bootstrapIfLoggedIn() {
    if (!global.VetAuth?.isLoggedIn?.()) return;
    if (store.pets.length || store.loading) return;
    loadAllPets();
  }

  global.VetLiveApi = {
    loadAllPets,
    store,
    showPetDetail,
    onCheckupScreen,
    applyDateFilter,
    setHorseKpiLabels,
    setTotalHorseCount,
    bootstrapIfLoggedIn,
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindUi();
    bootstrapIfLoggedIn();
  });
})(window);
