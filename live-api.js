/**
 * Live EC2 API → Health Records, temperatures, ward register merge.
 */
(function (global) {
  const WARD_REGISTER_MAY_2026 = [
    { regt: "7806", name: "Rustem", disease: "Swelling L/H", admission: "02/05/26", discharge: "08/05/26", active: false },
    { regt: "0958", name: "—", disease: "Swelling L/Hock", admission: "05/05/26", discharge: "11/05/26", active: false },
    { regt: "7471", name: "Tejas", disease: "Dermatitis", admission: "06/05/26", discharge: "13/05/26", active: false, struck: true },
    { regt: "0591", name: "—", disease: "Wd Lac Lt shoulder", admission: "10/05/26", discharge: "15/05/26", active: false },
    { regt: "7471", name: "Tejas", disease: "Swelling L/H", admission: "13/05/26", discharge: "19/05/26", active: false },
    { regt: "25126", name: "Gladiator", disease: "Dermatitis", admission: "18/05/26", discharge: "24/05/26", active: false },
    { regt: "7471", name: "Tejas", disease: "Dermatitis", admission: "23/05/26", discharge: "", active: true },
  ];

  const HORSE_TEMP = { min: 37.2, max: 38.6 };
  const CATTLE_TEMP = { min: 38.0, max: 39.5 };

  const store = {
    client: null,
    pets: [],
    loading: false,
    error: null,
    lastSync: null,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function getSpecies() {
    if (document.body.classList.contains("device-army")) return "horse";
    const sel = $("species-select");
    return sel?.value === "horse" ? "horse" : "cattle";
  }

  function tempNorms() {
    return getSpecies() === "horse" ? HORSE_TEMP : CATTLE_TEMP;
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

  function formatTemp(c) {
    const n = Number(c);
    if (!Number.isFinite(n) || n <= 0) return "—";
    return `${n.toFixed(1)}°C`;
  }

  function latestRefTemps(readings) {
    const refs = readings.filter((r) => {
      const s = String(r.sensor_type || r.type || "").toLowerCase();
      return s.includes("reference");
    });
    const vals = refs
      .map((r) => Number(r.temperature_value))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (!vals.length) {
      const any = readings
        .map((r) => Number(r.temperature_value))
        .filter((n) => Number.isFinite(n) && n > 0);
      return any.length ? any[any.length - 1] : null;
    }
    return vals[vals.length - 1];
  }

  function vitalsStatus(celsius) {
    const n = Number(celsius);
    if (!Number.isFinite(n) || n <= 0) return { label: "No reading", class: "" };
    const { min, max } = tempNorms();
    if (n > max + 0.8) return { label: "Critical", class: "high" };
    if (n > max) return { label: "Elevated", class: "warn" };
    if (n < min) return { label: "Low", class: "warn" };
    return { label: "Stable", class: "" };
  }

  function badgeHtml(label, cls) {
    const c = cls ? ` ${cls}` : "";
    if (label === "Critical" || label === "High Risk") return `<span class="badge high${c}">${label}</span>`;
    if (label === "Elevated" || label === "At Risk" || label === "Moderate Risk") return `<span class="badge warn${c}">${label}</span>`;
    if (label === "Heat Likely") return `<span class="badge heat">${label}</span>`;
    return `<span class="badge${c}">${label}</span>`;
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

  function setChip(text, ok) {
    const chip = $("api-connection-chip");
    if (!chip) return;
    chip.textContent = text;
    chip.classList.toggle("api-chip-ok", !!ok);
    chip.classList.toggle("api-chip-err", ok === false);
  }

  function renderWardRegister() {
    const body = $("ward-register-body");
    if (!body) return;
    body.innerHTML = WARD_REGISTER_MAY_2026.map((row) => {
      const status = row.active ? "Active" : row.struck ? "Closed (struck)" : "Discharged";
      const statusClass = row.active ? "high" : "";
      const name = row.name === "—" ? `<em>${row.regt}</em>` : row.name;
      return `<tr class="${row.active ? "ward-row-active" : ""}${row.struck ? " ward-row-struck" : ""}">
        <td>${row.regt}</td>
        <td>${name}</td>
        <td>${row.disease}</td>
        <td>${row.admission}</td>
        <td>${row.discharge || "—"}</td>
        <td>${badgeHtml(status, statusClass)}</td>
      </tr>`;
    }).join("");
  }

  function findApiPetForWard(row) {
    const name = (row.name || "").toLowerCase();
    if (!name || name === "—") {
      return store.pets.find((p) => petId(p).includes(row.regt) || petName(p).toLowerCase().includes(row.regt));
    }
    return store.pets.find((p) => petName(p).toLowerCase() === name);
  }

  async function enrichPet(pet) {
    const id = petId(pet);
    if (!id) return pet;
    try {
      const sessRaw = await store.client.examSessions(id);
      const sessions = global.VetApiNormalize.normalizeSessions(sessRaw);
      pet._sessions = sessions;
      pet._sessionCount = sessions.length;
      const latest = sessions[0];
      const sid = String(latest?.id ?? latest?.exam_session_id ?? "").trim();
      if (sid) {
        const tempRaw = await store.client.petTemperatureBySession(id, sid);
        pet._temperatures = normalizeTemperature(tempRaw);
        pet._latestTempC = latestRefTemps(pet._temperatures);
        pet._latestSessionLabel = String(latest.started_at ?? latest.created_at ?? sid.slice(0, 8));
      } else {
        pet._temperatures = [];
        pet._latestTempC = null;
      }
    } catch (e) {
      pet._apiError = e.message || String(e);
    }
    return pet;
  }

  function renderHealthRecordsTable() {
    const body = $("health-records-body");
    const status = $("health-records-status");
    if (!body) return;

    if (store.error) {
      if (status) status.textContent = store.error;
      body.innerHTML = `<tr><td colspan="6">Could not load pets. Check ngrok, CORS, password, and device ID (${global.API_CONFIG?.deviceId}).</td></tr>`;
      return;
    }

    if (!store.pets.length) {
      if (status) status.textContent = "No pets returned for this device.";
      body.innerHTML = `<tr><td colspan="6">No pets on API. Try device ID ARMY / Bruno in config.api.js.</td></tr>`;
      return;
    }

    const sync = store.lastSync ? new Date(store.lastSync).toLocaleString() : "";
    if (status) status.textContent = `${store.pets.length} pet(s) · last sync ${sync}`;

    body.innerHTML = store.pets
      .map((pet) => {
        const id = petId(pet);
        const name = petName(pet);
        const sessions = pet._sessionCount ?? "…";
        const temp = formatTemp(pet._latestTempC);
        const vs = vitalsStatus(pet._latestTempC);
        const err = pet._apiError ? ` <small title="${pet._apiError}">⚠</small>` : "";
        return `<tr class="health-pet-row" data-pet-id="${id}">
          <td>${id.slice(0, 12)}${id.length > 12 ? "…" : ""}</td>
          <td><strong>${name}</strong>${err}</td>
          <td>${sessions}</td>
          <td>${temp}</td>
          <td>${badgeHtml(vs.label, vs.class)}</td>
          <td><button type="button" class="mini health-view-btn" data-pet-id="${id}">Temps</button></td>
        </tr>`;
      })
      .join("");

    body.querySelectorAll(".health-view-btn").forEach((btn) => {
      btn.addEventListener("click", () => showPetDetail(btn.dataset.petId));
    });
  }

  function showPetDetail(id) {
    const pet = store.pets.find((p) => petId(p) === id);
    const panel = $("health-detail-panel");
    if (!pet || !panel) return;
    panel.hidden = false;
    $("health-detail-title").textContent = `${petName(pet)} — temperature`;
    $("health-detail-meta").textContent = `Pet ID: ${id} · ${pet._sessionCount ?? 0} session(s)`;

    const temps = pet._temperatures || [];
    const grid = $("health-detail-temps");
    if (grid) {
      if (!temps.length) {
        grid.innerHTML = "<p>No temperature rows for latest session.</p>";
      } else {
        grid.innerHTML = temps
          .map((r) => {
            const sensor = r.sensor_type || r.type || "reading";
            const num = r.reading_number != null ? `#${r.reading_number}` : "";
            const ts = r.timestamp || r.created_at || "";
            return `<article class="health-temp-card">
              <p>${sensor} ${num}</p>
              <strong>${formatTemp(r.temperature_value)}</strong>
              <small>${ts}</small>
            </article>`;
          })
          .join("");
      }
    }

    const ul = $("health-detail-sessions");
    if (ul) {
      const sessions = pet._sessions || [];
      ul.innerHTML = sessions.length
        ? sessions
            .map((s) => {
              const sid = s.id || s.exam_session_id || "";
              const started = s.started_at || s.created_at || "";
              return `<li>${sid.slice(0, 8)}… · ${started}</li>`;
            })
            .join("")
        : "<li>No exam sessions</li>";
    }
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function loadAllPets() {
    if (store.loading) return;
    store.loading = true;
    store.error = null;
    setChip("API: loading…", null);
    const status = $("health-records-status");
    if (status) status.textContent = "Connecting to API…";

    try {
      const client = await ensureClient();
      const raw = await client.listPets();
      const pets = global.VetApiNormalize.normalizePets(raw);
      store.pets = pets.map((p) => ({ ...p }));

      for (let i = 0; i < store.pets.length; i++) {
        if (status) status.textContent = `Loading temperatures ${i + 1} / ${store.pets.length}…`;
        await enrichPet(store.pets[i]);
      }

      store.lastSync = Date.now();
      setChip(`API: ${store.pets.length} pets`, true);

      const activeWard = WARD_REGISTER_MAY_2026.filter((w) => w.active);
      for (const w of activeWard) {
        const match = findApiPetForWard(w);
        if (match && match._latestTempC != null) {
          w._apiTemp = match._latestTempC;
        }
      }
    } catch (e) {
      store.error = e.message || String(e);
      setChip("API: error", false);
      console.error("Live API:", e);
    } finally {
      store.loading = false;
      renderHealthRecordsTable();
      updateDashboardKpis();
    }
  }

  function updateDashboardKpis() {
    if (!store.pets.length) return;
    const total = store.pets.length;
    let healthy = 0;
    let risk = 0;
    let sick = 0;
    for (const p of store.pets) {
      const vs = vitalsStatus(p._latestTempC);
      if (vs.label === "Critical" || vs.label === "Elevated") sick++;
      else if (vs.label === "Low" || vs.label === "No reading") risk++;
      else healthy++;
    }
    const kpiTotal = document.querySelector(".kpi-item.total h4");
    const kpiHealthy = document.querySelector(".kpi-item.healthy h4");
    const kpiRisk = document.querySelector(".kpi-item.risk h4");
    const kpiSick = document.querySelector(".kpi-item.sick h4");
    if (kpiTotal) kpiTotal.textContent = String(total);
    if (kpiHealthy) kpiHealthy.textContent = String(healthy);
    if (kpiRisk) kpiRisk.textContent = String(risk);
    if (kpiSick) kpiSick.textContent = String(sick);
  }

  function onCheckupScreen() {
    renderWardRegister();
    if (!store.lastSync && !store.loading) loadAllPets();
    else renderHealthRecordsTable();
  }

  function bindUi() {
    renderWardRegister();
    $("api-refresh-btn")?.addEventListener("click", () => loadAllPets());

    document.getElementById("sidebar-nav")?.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-screen]");
      if (link?.dataset.screen === "checkup") onCheckupScreen();
    });

    $("species-select")?.addEventListener("change", () => {
      if (document.getElementById("checkup")?.classList.contains("active")) renderHealthRecordsTable();
    });

    if (location.hash === "#checkup") onCheckupScreen();
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindUi();
    global.VetLiveApi = { loadAllPets, store, showPetDetail, onCheckupScreen };
  });
})(window);
