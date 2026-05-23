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

  const WARD_REGTS = new Set(
    WARD_REGISTER_MAY_2026.map((row) => String(row.regt || "").trim()).filter(Boolean)
  );

  /** Unique Regt No. in May 2026 ward register (dashboard Sick KPI). */
  function countWardSickHorses() {
    return WARD_REGTS.size;
  }

  function getWardHorsesByRegt() {
    const byRegt = new Map();
    for (const row of WARD_REGISTER_MAY_2026) {
      const regt = String(row.regt || "").trim();
      if (!regt) continue;
      const cur = byRegt.get(regt);
      if (!cur) byRegt.set(regt, row);
      else if (row.active && !cur.active) byRegt.set(regt, row);
    }
    return Array.from(byRegt.values());
  }

  function findPetForWardRow(ward) {
    const regt = String(ward.regt || "").trim();
    const wardName = ward.name && ward.name !== "—" ? ward.name.toLowerCase() : "";
    return store.pets.find((p) => {
      if (petRmtNo(p) === regt) return true;
      const n = petName(p).toLowerCase();
      const d = displayName(p).toLowerCase();
      return wardName && (n === wardName || d === wardName);
    });
  }

  function isPetInWard(pet) {
    const rmt = petRmtNo(pet);
    if (rmt !== "—" && WARD_REGTS.has(rmt)) return true;
    return !!WARD_BY_NAME[petName(pet).toLowerCase()];
  }

  function petHealthTag(pet) {
    if (isPetInWard(pet)) return "sick";
    return "healthy";
  }

  function petAgeYears(pet) {
    const n = Number(pet?.age);
    return Number.isFinite(n) ? n : null;
  }

  function ageMatchesBand(ageYears, band) {
    if (!band || band === "all") return true;
    if (ageYears == null) return false;
    if (band === "3-6") return ageYears >= 3 && ageYears <= 6;
    if (band === "7-10") return ageYears >= 7 && ageYears <= 10;
    if (band === "11-14") return ageYears >= 11 && ageYears <= 14;
    if (band === "15-18") return ageYears >= 15 && ageYears <= 18;
    if (band === "19+") return ageYears >= 19;
    return String(ageYears) === String(band);
  }

  function populateHerdFilters() {
    if (!global.VetAuth?.isLoggedIn?.()) return;
    const ageSel = document.getElementById("herd-age-filter");
    if (ageSel) {
      ageSel.innerHTML = `
        <option value="all">All Age</option>
        <option value="3-6">3 – 6 years</option>
        <option value="7-10">7 – 10 years</option>
        <option value="11-14">11 – 14 years</option>
        <option value="15-18">15 – 18 years</option>
        <option value="19+">19+ years</option>
      `;
    }
    const breedSel = document.getElementById("herd-breed-filter");
    if (breedSel) {
      const breeds = [
        ...new Set(
          store.pets
            .map((p) => String(p.breed ?? p.species ?? "").trim())
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
      breedSel.innerHTML =
        '<option value="all">All Breed</option>' +
        breeds.map((b) => `<option value="${b.replace(/"/g, "&quot;")}">${b}</option>`).join("");
    }
    const statusSel = document.getElementById("herd-status-filter");
    const atRiskOpt = statusSel?.querySelector('option[value="at-risk"]');
    if (atRiskOpt) atRiskOpt.textContent = "No check today";
  }

  function horseDisplayName(ward, pet) {
    if (pet) {
      const dn = displayName(pet);
      if (dn && dn !== "—") return dn;
      const n = petName(pet);
      if (n && !/^RMT\d*$/i.test(n)) return n;
    }
    if (ward?.name && ward.name !== "—") return ward.name;
    return "—";
  }

  function diseaseRiskGroup(disease) {
    const d = String(disease || "").toLowerCase();
    if (/dermatitis|lac|wound|infection|strangles|influenza|tetanus/i.test(d)) return "infection";
    if (/respiratory|pneumonia|asthma/i.test(d)) return "respiratory";
    if (/colic|digestive|gut|impaction/i.test(d)) return "digestive colic";
    if (/swelling|hock|lameness|joint|hoof|mobility|shoulder/i.test(d)) return "hoof mobility";
    if (/heat|dehydration|stress|exertion/i.test(d)) return "environment heat-stress";
    return "hoof mobility";
  }

  const RISK_GROUP_META = [
    {
      diseaseKey: "infection",
      title: "Infection",
      note: "Contagious and systemic infection risks",
      icon: "assets/icons/horse-risk-infection.svg",
      affectedLabel: "Horses affected",
    },
    {
      diseaseKey: "respiratory",
      title: "Respiratory",
      note: "Breathing and lung-related risks",
      icon: "assets/icons/horse-risk-respiratory.svg",
      affectedLabel: "Horses affected",
    },
    {
      diseaseKey: "digestive colic",
      title: "Digestive / Colic",
      note: "Gastrointestinal health and colic monitoring",
      icon: "assets/icons/horse-risk-digestive.svg",
      affectedLabel: "Horses affected",
    },
    {
      diseaseKey: "hoof mobility",
      title: "Hoof & Mobility",
      note: "Hoof health and movement performance risks",
      icon: "assets/icons/horse-risk-mobility.svg",
      affectedLabel: "Horses affected",
    },
    {
      diseaseKey: "environment heat-stress",
      title: "Environmental Stress",
      note: "Temperature and workload related alerts",
      icon: "assets/icons/horse-risk-environment.svg",
      affectedLabel: "Horses affected",
    },
  ];

  function buildWardRiskGroups() {
    const buckets = new Map(RISK_GROUP_META.map((m) => [m.diseaseKey, []]));
    for (const ward of getWardHorsesByRegt()) {
      const key = diseaseRiskGroup(ward.disease);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(ward);
    }
    return buckets;
  }

  function renderWardRiskDashboard() {
    if (!global.VetAuth?.isLoggedIn?.()) return;
    const buckets = buildWardRiskGroups();
    const cards = RISK_GROUP_META.map((meta) => {
      const wards = buckets.get(meta.diseaseKey) || [];
      const diseases = [...new Set(wards.map((w) => w.disease))].join(", ") || "—";
      return {
        ...meta,
        diseases,
        affected: String(wards.length),
      };
    });
    global.VetDashboardUi?.updateRiskGroupCards?.(cards);

    const actionRows = getWardHorsesByRegt().map((ward) => {
      const pet = findPetForWardRow(ward);
      const regt = String(ward.regt).trim();
      const name = horseDisplayName(ward, pet);
      const group = diseaseRiskGroup(ward.disease);
      const statusClass = ward.active ? "warning" : "monitor";
      return {
        id: regt,
        name,
        breed: name,
        alert: ward.disease,
        alertClass: ward.active ? "red" : "purple",
        status: ward.active ? "Active" : "Discharged",
        statusClass,
        severity: ward.active ? "Active case" : "Ward history",
        severityClass: ward.active ? "sev-critical" : "sev-medium",
        risk: riskGroupLabel(group),
        riskClass: ward.active ? "critical" : "high",
        lastAbnormal: wardLastEventLabel(ward),
        disease: `${ward.disease.toLowerCase()} ${group}`,
        priority: group.split(" ")[0],
        wardDisease: wardDiseaseKey(ward.disease),
      };
    });
    global.VetDashboardUi?.updateDashboardActionRows?.(actionRows);
    renderWardDiseaseDistribution();
    renderWardDailyReport();
    updateHealthRecordsSummary();
  }

  function wardDiseaseKey(label) {
    return String(label || "")
      .toLowerCase()
      .replace(/[^\w]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function riskGroupLabel(group) {
    const g = String(group || "").toLowerCase();
    if (g.includes("infection")) return "Infection";
    if (g.includes("respiratory")) return "Respiratory";
    if (g.includes("digestive") || g.includes("colic")) return "Digestive";
    if (g.includes("hoof") || g.includes("mobility")) return "Limb";
    if (g.includes("heat") || g.includes("environment")) return "Environment";
    return "Other";
  }

  function wardLastEventLabel(ward) {
    return ward.active
      ? `Admitted ${ward.admission}`
      : `Discharged ${ward.discharge || "—"}`;
  }

  /** Filter dashboard “Horses Requiring Action” table (stay on dashboard). */
  function applyWardActionFilter({ diseaseKey = null, riskGroup = null, label = null } = {}) {
    const body = document.getElementById("dashboard-action-body");
    if (!body) return false;
    const key = diseaseKey ? wardDiseaseKey(diseaseKey) : null;
    const rg = riskGroup ? String(riskGroup).trim().toLowerCase() : null;
    const rgToken = rg ? rg.split(/\s+/)[0] : null;

    body.querySelectorAll("tr").forEach((row) => {
      if (!key && !rg) {
        row.classList.remove("row-hidden");
        return;
      }
      let visible = true;
      if (key) visible = (row.dataset.wardDisease || "") === key;
      if (rg && visible) {
        const dis = (row.dataset.disease || "").toLowerCase();
        const pri = (row.dataset.priority || "").toLowerCase();
        visible = dis.includes(rg) || (!!rgToken && pri === rgToken);
      }
      row.classList.toggle("row-hidden", !visible);
    });

    const chip = document.getElementById("queue-filter-label");
    if (chip) {
      chip.textContent = label ? `Showing: ${label}` : "Showing: All horses requiring action";
    }

    document.querySelectorAll("#disease-mix-filters li").forEach((li) => {
      li.classList.toggle("filter-active", !!key && li.dataset.disease === key);
    });

    if (typeof global.setActiveScreen === "function") global.setActiveScreen("dashboard");
    return true;
  }

  function buildWardDiseaseDistribution() {
    const counts = new Map();
    for (const row of WARD_REGISTER_MAY_2026) {
      counts.set(row.disease, (counts.get(row.disease) || 0) + 1);
    }
    const total = WARD_REGISTER_MAY_2026.length;
    const palette = [
      { color: "#e24646", dot: "mast" },
      { color: "#f0a11e", dot: "fmd" },
      { color: "#2f9d59", dot: "hs" },
      { color: "#4b6bc8", dot: "bq" },
      { color: "#28a7a0", dot: "tick" },
      { color: "#8f5ad7", dot: "lsd" },
    ];
    const rows = Array.from(counts.entries()).map(([label, count], i) => ({
      key: wardDiseaseKey(label),
      label,
      count,
      percent: Math.round((count / total) * 100),
      color: palette[i % palette.length].color,
      dot: palette[i % palette.length].dot,
    }));
    const sum = rows.reduce((s, r) => s + r.percent, 0);
    if (rows.length && sum !== 100) rows[rows.length - 1].percent += 100 - sum;
    return { totalCases: total, rows };
  }

  function renderWardDiseaseDistribution() {
    if (!global.VetAuth?.isLoggedIn?.()) return;
    global.VetDashboardUi?.updateDiseaseDistribution?.(buildWardDiseaseDistribution());
  }

  function buildWardDailyReport() {
    const dateIso = getSelectedDate();
    const dateLabel = formatDisplayDate(dateIso);
    const times = ["07:55", "08:20", "09:10", "10:02", "11:15", "14:00"];
    const vitals = [];
    const treatments = [];
    const checkups = [];

    WARD_REGISTER_MAY_2026.forEach((ward, i) => {
      const pet = findPetForWardRow(ward);
      const regt = String(ward.regt).trim();
      const name = horseDisplayName(ward, pet);
      const label = name !== "—" ? `Horse ${regt} · ${name}` : `Horse ${regt}`;
      const time = times[i] || "12:00";

      let vitalDetail;
      let vitalTag = "Complete";
      let vitalClass = "done";
      if (pet?._takenOnDate && pet._latestTempC != null) {
        vitalDetail = `Temp ${formatTemp(pet._latestTempC)} · ${ward.disease}`;
      } else if (ward.active) {
        vitalDetail = `${ward.disease} — monitor vitals · ward active`;
        vitalTag = "Flagged";
        vitalClass = "flagged";
      } else {
        vitalDetail = `${ward.disease} — discharged ${ward.discharge || "—"}`;
        vitalTag = "Logged";
        vitalClass = "";
      }
      vitals.push({
        id: regt,
        label,
        time,
        detail: vitalDetail,
        staff: "Ravi K.",
        tag: vitalTag,
        tagClass: vitalClass,
      });

      treatments.push({
        id: regt,
        label,
        time: ["08:50", "09:40", "10:30", "11:00", "11:20", "14:30"][i] || "13:00",
        detail: ward.active
          ? `${ward.disease} — treatment protocol in progress (ward)`
          : `${ward.disease} — discharge care completed`,
        staff: "Dr. Santosh",
        tag: ward.active ? "Active" : "Done",
        tagClass: ward.active ? "active" : "done",
      });

      checkups.push({
        id: regt,
        label,
        time: ["08:05", "09:25", "10:15", "11:00", "11:30", "13:00"][i] || "12:30",
        detail: `Ward checkup — ${ward.disease} (${ward.active ? "active" : "discharged"})`,
        staff: "Dr. Santosh",
        tag: "Completed",
        tagClass: "done",
      });
    });

    const activeN = WARD_REGISTER_MAY_2026.filter((w) => w.active).length;
    const dischargedN = WARD_REGISTER_MAY_2026.length - activeN;
    const totalPets = store.pets.length || 53;

    return {
      title: "Today's Daily Report",
      subtitle: "Stable rounds — ward register (May 2026) & device vitals",
      dateLabel,
      syncLabel: "Last device sync: 06:52",
      summaryNotes: {
        vitals: "Ward & device sessions",
        treatments: "Dr. Santosh · ward protocols",
        checkups: "Clinical ward reviews",
        completed: "Discharged + active tracked",
      },
      summary: {
        vitals: vitals.length,
        treatments: treatments.length,
        checkups: checkups.length,
        completed: dischargedN + activeN,
      },
      vitals,
      treatments,
      checkups,
      other: [
        {
          id: "—",
          label: "Ward register May 2026",
          time: "07:15",
          detail: `${countWardSickHorses()} horses on ward · ${activeN} active (Tejas — Dermatitis)`,
          staff: "Supervisor",
          tag: "Log",
          tagClass: "",
        },
        {
          id: "—",
          label: "Stable round · ARMY",
          time: "06:52",
          detail: `${totalPets} horses registered · morning device round`,
          staff: "External",
          tag: "Planned",
          tagClass: "pending",
        },
      ],
    };
  }

  function renderWardDailyReport() {
    if (!global.VetAuth?.isLoggedIn?.()) return;
    global.VetDashboardUi?.updateDailyReport?.(buildWardDailyReport());
  }

  function applyHerdDiseaseFilter(diseaseKey, label) {
    if (!global.VetAuth?.isLoggedIn?.()) return false;
    const clean = (label || diseaseKey || "").replace(/\s*:\s*[\d.]+%.*$/i, "").trim();
    return applyWardActionFilter({ diseaseKey, label: clean || diseaseKey });
  }

  function applyHerdRiskFilter(diseaseKey, label) {
    if (!global.VetAuth?.isLoggedIn?.()) return false;
    const clean = (label || diseaseKey || "").trim();
    return applyWardActionFilter({ riskGroup: diseaseKey, label: clean || diseaseKey });
  }

  function herdHealthBadge(health, wardRow) {
    if (health === "sick" && wardRow) {
      const status = wardRow.active ? "Active" : "Discharged";
      const cls = wardRow.active ? "high" : "muted";
      return `<span class="badge ${cls}">${wardRow.disease} · ${status}</span>`;
    }
    if (health === "healthy") return '<span class="badge">Healthy</span>';
    return '<span class="badge heat">Heat</span>';
  }

  function renderHerdTable() {
    const body = document.querySelector("#herd-table tbody");
    if (!body || !global.VetAuth?.isLoggedIn?.()) return;

    const wardRows = getWardHorsesByRegt();
    const matchedPetIds = new Set();
    const html = [];

    for (const ward of wardRows) {
      const pet = findPetForWardRow(ward);
      const petKey = pet ? petId(pet) : "";
      if (petKey) matchedPetIds.add(petKey);

      const regt = String(ward.regt).trim();
      const name = horseDisplayName(ward, pet);
      const breed = pet
        ? String(pet.breed ?? pet.species ?? "—").trim() || "—"
        : "—";
      const age = pet?.age != null ? String(pet.age) : "—";
      const lastCheck = wardLastEventLabel(ward);
      const openId = petKey || regt;
      const riskGroup = diseaseRiskGroup(ward.disease);
      const wardDisKey = wardDiseaseKey(ward.disease);

      const ageNum = petAgeYears(pet);
      html.push(`<tr class="clickable-cattle herd-row-live" data-cow-id="${openId}" data-health="sick" data-regt="${regt}" data-risk-group="${riskGroup}" data-ward-disease="${wardDisKey}" data-age="${ageNum ?? ""}" data-breed="${breed.replace(/"/g, "")}"${petKey ? ` data-pet-id="${petKey}"` : ""}>
        <td>${regt}</td>
        <td>${name}</td>
        <td>${breed}</td>
        <td>${age}${age !== "—" ? " yrs" : ""}</td>
        <td>${lastCheck}</td>
        <td>${herdHealthBadge("sick", ward)}</td>
        <td><button type="button" class="mini herd-open-btn" data-open-id="${openId}"${petKey ? ` data-pet-id="${petKey}"` : ""}>Open</button></td>
      </tr>`);
    }

    for (const pet of store.pets) {
      const id = petId(pet);
      if (!id || matchedPetIds.has(id) || isPetInWard(pet)) continue;
      const health = petHealthTag(pet);
      const regt = petRmtNo(pet);
      const label = regt !== "—" ? regt : id;
      const name = horseDisplayName(null, pet);
      const breed = String(pet.breed ?? pet.species ?? "—").trim() || "—";
      const age = pet.age != null ? `${pet.age} yrs` : "—";
      const lastCheck = pet._takenOnDate
        ? (pet._latestTempC != null ? `${formatTemp(pet._latestTempC)} · ${formatDisplayDate(getSelectedDate())}` : "Taken")
        : "Not taken";

      const ageNum = petAgeYears(pet);
      const noVitals = !pet._takenOnDate;
      html.push(`<tr class="clickable-cattle herd-row-live" data-cow-id="${id}" data-health="${health}" data-pet-id="${id}" data-age="${ageNum ?? ""}" data-breed="${breed.replace(/"/g, "")}" data-no-vitals="${noVitals ? "1" : "0"}">
        <td>${label}</td>
        <td>${name}</td>
        <td>${breed}</td>
        <td>${age}</td>
        <td>${lastCheck}</td>
        <td>${herdHealthBadge(health)}</td>
        <td><button type="button" class="mini herd-open-btn" data-open-id="${id}" data-pet-id="${id}">Open</button></td>
      </tr>`);
    }

    body.innerHTML = html.join("") || '<tr><td colspan="7">No horses loaded.</td></tr>';
    bindHerdRowActions();
    populateHerdFilters();
  }

  function bindHerdRowActions() {
    const body = document.querySelector("#herd-table tbody");
    if (!body || body.dataset.liveBound === "1") return;
    body.dataset.liveBound = "1";
    body.addEventListener("click", (e) => {
      const btn = e.target.closest(".herd-open-btn");
      if (!btn) return;
      e.stopPropagation();
      const id = btn.dataset.petId || btn.dataset.openId;
      if (id) openHorseDetail(id);
    });
  }

  function applyHerdKpiFilter(filter, label) {
    if (!global.VetAuth?.isLoggedIn?.()) return false;
    renderHerdTable();
    if (typeof global.__applyHerdFilter === "function") {
      global.__applyHerdFilter(filter || "all", label);
    }
    return true;
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

  /** Same as device firmware: trunc(c * 10 + 0.5) → one decimal °C. */
  function roundTempC(c) {
    const n = Number(c);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.trunc(n * 10 + 0.5) / 10;
  }

  function formatTemp(c) {
    const rounded = roundTempC(c);
    if (rounded == null) return "—";
    return `${rounded.toFixed(1)}°C`;
  }

  function latestRefTemp(readings) {
    const refs = readings.filter((r) =>
      String(r.sensor_type || r.type || "").toLowerCase().includes("reference")
    );
    const vals = refs.map((r) => Number(r.temperature_value)).filter((n) => Number.isFinite(n) && n > 0);
    if (vals.length) return roundTempC(vals[vals.length - 1]);
    const any = readings.map((r) => Number(r.temperature_value)).filter((n) => Number.isFinite(n) && n > 0);
    return any.length ? roundTempC(any[any.length - 1]) : null;
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
    if (global.VetAuth?.isLoggedIn?.()) renderWardRiskDashboard();
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

  function setHorseNav() {
    const link = document.getElementById("nav-herd-link");
    if (!link) return;
    link.innerHTML =
      '<span class="nav-icon"><img src="assets/icons/horses.svg?v=2" alt="" /></span>Horses';
  }

  function setHorseKpiLabels() {
    setHorseNav();
    const kpiTotalIcon = document.querySelector(".kpi-item.total .kpi-icon img");
    if (kpiTotalIcon) kpiTotalIcon.src = "assets/icons/horses.svg?v=2";
    const totalLabel = $("kpi-total-label");
    const riskLabel = $("kpi-risk-label");
    const heatLabel = $("kpi-heat-label");
    if (totalLabel) totalLabel.textContent = "Total Horses";
    if (riskLabel) riskLabel.textContent = "Not taken";
    if (heatLabel) heatLabel.textContent = "Estrus Alerts";
    const dailyCompleted = document.getElementById("daily-kpi-completed-note");
    if (dailyCompleted) dailyCompleted.textContent = "Ward round tracked";
    const dailyAnimals = document.querySelector("#daily-report-kpis .daily-kpi.completed p");
    if (dailyAnimals) dailyAnimals.textContent = "Horses completed";
    const categoryHead = document.querySelector(".dashboard-ops-grid .data-table thead th:nth-child(6)");
    if (categoryHead) categoryHead.textContent = "Category";
    const diseaseSub = document.querySelector(".disease-graph-panel .panel-head p");
    if (diseaseSub) diseaseSub.textContent = "Ward cases by condition — click to filter list";
    const riskNote = document.getElementById("risk-groups-queue-note");
    if (riskNote) riskNote.textContent = "Click a category to filter the action list";
    populateHerdFilters();
  }

  function setTotalHorseCount(count) {
    const el = $("kpi-total-count");
    if (el) el.textContent = String(count);
    setHorseKpiLabels();
  }

  function updateHealthRecordsSummary() {
    const el = $("health-records-status");
    if (el) el.textContent = `${countWardSickHorses()} horses under treatment`;
  }

  function maxTempFromReadings(readings, filterFn) {
    const vals = (readings || [])
      .filter(filterFn)
      .map((r) => Number(r.temperature_value))
      .filter((n) => Number.isFinite(n) && n > 0);
    return vals.length ? Math.max(...vals) : null;
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

  async function getLastTakenTemperature(pet) {
    if (pet._latestTempC != null && Number(pet._latestTempC) > 0) {
      return roundTempC(pet._latestTempC);
    }
    await ensureClient();
    await loadSessionsForPet(pet);
    const sessions = [...(pet._sessions || [])].sort((a, b) => {
      const ta = new Date(a.started_at || a.created_at || 0).getTime();
      const tb = new Date(b.started_at || b.created_at || 0).getTime();
      return ta - tb;
    });
    for (let i = sessions.length - 1; i >= 0; i--) {
      let readings = [];
      try {
        readings = await loadSessionTemperatures(pet, sessions[i]);
      } catch {
        readings = [];
      }
      const irMax = maxTempFromReadings(readings, (r) =>
        /ir|ear/i.test(String(r.sensor_type || r.type || ""))
      );
      if (irMax != null) return roundTempC(irMax);
      const refMax = maxTempFromReadings(readings, (r) =>
        /reference|thermometer/i.test(String(r.sensor_type || r.type || ""))
      );
      if (refMax != null) return roundTempC(refMax);
    }
    return null;
  }

  async function buildTemperatureTrend(pet) {
    await ensureClient();
    await loadSessionsForPet(pet);
    const sessions = [...(pet._sessions || [])].sort((a, b) => {
      const ta = new Date(a.started_at || a.created_at || 0).getTime();
      const tb = new Date(b.started_at || b.created_at || 0).getTime();
      return ta - tb;
    });
    const recent = sessions.slice(-14);
    const dayMap = new Map();

    for (const session of recent) {
      let readings = [];
      try {
        readings = await loadSessionTemperatures(pet, session);
      } catch {
        readings = [];
      }
      const dateIso = sessionStartedDateIst(session);
      if (!dateIso) continue;
      const irMax = maxTempFromReadings(readings, (r) =>
        /ir|ear/i.test(String(r.sensor_type || r.type || ""))
      );
      if (irMax == null) continue;
      if (!dayMap.has(dateIso)) dayMap.set(dateIso, []);
      dayMap.get(dateIso).push(irMax);
    }

    const days = [...dayMap.keys()].sort();
    const chartLabels = [];
    const tempTrend = [];
    for (const iso of days) {
      const vals = dayMap.get(iso);
      if (!vals.length) continue;
      const [, m, d] = iso.split("-");
      chartLabels.push(`${d}/${m}`);
      tempTrend.push(roundTempC(Math.max(...vals)));
    }

    return { chartLabels, tempTrend };
  }

  function findWardForPet(pet) {
    const regt = petRmtNo(pet);
    return getWardHorsesByRegt().find((w) => String(w.regt).trim() === regt) || null;
  }

  async function openHorseDetail(petIdOrRegt) {
    if (!global.VetAuth?.isLoggedIn?.()) return;
    let pet = store.pets.find((p) => petId(p) === String(petIdOrRegt));
    if (!pet) {
      pet = store.pets.find((p) => petRmtNo(p) === String(petIdOrRegt));
    }
    const ward =
      getWardHorsesByRegt().find((w) => String(w.regt).trim() === String(petIdOrRegt)) ||
      (pet ? findWardForPet(pet) : null);

    if (!pet && !ward) return;

    if (!pet && ward) {
      global.openAnimalDetailPanel?.({
        id: ward.regt,
        name: horseDisplayName(ward, null),
        breed: "—",
        age: "—",
        statusLabel: ward.active ? "Active" : "Discharged",
        statusClass: ward.active ? "crit" : "",
        resultTitle: ward.disease,
        resultNote: `Ward admission ${ward.admission}`,
        vitals: [`Condition: ${ward.disease}`, `Status: ${ward.active ? "Active" : "Discharged"}`],
        parsed: { temp: null, hr: null, spo2: null, resp: null, activity: "—" },
        chartLabels: [],
        tempTrend: [],
        modalImageSrc: "assets/icons/horse-sidebar.jpg",
      });
      return;
    }

    if (!pet) return;

    await applyDateToPet(pet, getSelectedDate());
    const trend = await buildTemperatureTrend(pet);
    const lastTemp = await getLastTakenTemperature(pet);
    const w = findWardForPet(pet);
    const vs = vitalsStatus(lastTemp, lastTemp != null);

    global.openAnimalDetailPanel?.({
      id: petRmtNo(pet),
      name: horseDisplayName(w, pet),
      breed: String(pet.breed ?? pet.species ?? "—").trim() || "—",
      age: pet.age != null ? `${pet.age} yrs` : "—",
      statusLabel: w ? (w.active ? "Active ward" : "Discharged") : vs.label,
      statusClass: w?.active || vs.class === "high" ? "crit" : vs.class === "warn" ? "risk" : "",
      resultTitle: w?.disease || vs.label,
      resultNote: w
        ? `Ward: ${w.disease} · ${w.active ? "Active" : "Discharged"}`
        : "Stable health record",
      activeAlert: w?.active ? `${w.disease} — active ward case` : "No active ward alert",
      lastVitalsAt: lastTemp != null ? formatDisplayDate(getSelectedDate()) : "Not taken yet",
      vitals: [
        lastTemp != null ? `Temperature (last taken): ${formatTemp(lastTemp)}` : "Temperature: not taken",
        w ? `Ward: ${w.disease}` : "",
      ].filter(Boolean),
      parsed: {
        temp: lastTemp != null ? roundTempC(lastTemp) : null,
        hr: null,
        spo2: null,
        resp: null,
        activity: "—",
      },
      chartLabels: trend.chartLabels,
      tempTrend: trend.tempTrend,
      modalImageSrc: "assets/icons/horse-sidebar.jpg",
      history: w ? [`Ward admission ${w.admission}`, w.discharge ? `Discharged ${w.discharge}` : "Still active"] : [],
      todayLog: lastTemp != null ? [`Last temperature: ${formatTemp(lastTemp)}`] : [],
      protocol: ["Review temperature trend", "Monitor ward condition", "Notify vet if elevated"],
      recovery: [],
      advice: [],
      reports: [],
      assignee: "Dr. Santosh",
    });
  }

  async function applyDateFilter(dateIso) {
    store.selectedDate = dateIso;
    for (let i = 0; i < store.pets.length; i++) {
      await applyDateToPet(store.pets[i], dateIso);
    }
    updateDashboardKpis();
  }

  async function loadAllPets() {
    if (store.loading) return;
    store.loading = true;
    store.error = null;

    const kpiTotal = $("kpi-total-count");
    if (kpiTotal) kpiTotal.textContent = "…";

    try {
      const client = await ensureClient();
      const raw = await client.listPets();
      store.pets = global.VetApiNormalize.normalizePets(raw).map((p) => ({ ...p }));
      setTotalHorseCount(store.pets.length);
      updateDashboardKpis();
      await applyDateFilter(getSelectedDate());
    } catch (e) {
      store.error = e.message || String(e);
      console.error("Live API:", e);
      if (kpiTotal) kpiTotal.textContent = "—";
      updateHealthRecordsSummary();
    } finally {
      store.loading = false;
    }
  }

  function updateDashboardKpis() {
    const total = store.pets.length;
    if (!total) return;

    setTotalHorseCount(total);

    const wardSick = countWardSickHorses();
    const healthy = Math.max(0, total - wardSick);

    let notTaken = 0;
    let taken = 0;
    for (const p of store.pets) {
      if (!p._takenOnDate) notTaken++;
      else taken++;
    }

    const elHealthy = $("kpi-healthy-count");
    const elRisk = $("kpi-risk-count");
    const elSick = $("kpi-sick-count");
    if (elHealthy) elHealthy.textContent = String(healthy);
    if (elRisk) elRisk.textContent = String(notTaken);
    if (elSick) elSick.textContent = String(wardSick);

    updateHealthRecordsSummary();
    renderHerdTable();
    renderWardRiskDashboard();
  }

  function onCheckupScreen() {
    renderWardRegister();
    updateHealthRecordsSummary();
    if (!store.pets.length && !store.loading) loadAllPets();
    else updateDashboardKpis();
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

    document.getElementById("api-refresh-btn")?.addEventListener("click", () => loadAllPets());

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

  function resetStore() {
    store.client = null;
    store.pets = [];
    store.loading = false;
    store.error = null;
    store.selectedDate = null;
    const body = document.querySelector("#herd-table tbody");
    if (body) {
      body.dataset.liveBound = "";
      body.innerHTML = "";
    }
  }

  global.VetLiveApi = {
    loadAllPets,
    store,
    onCheckupScreen,
    applyDateFilter,
    setHorseKpiLabels,
    setHorseNav,
    setTotalHorseCount,
    bootstrapIfLoggedIn,
    resetStore,
    countWardSickHorses,
    updateDashboardKpis,
    renderHerdTable,
    applyHerdKpiFilter,
    applyHerdRiskFilter,
    renderWardRiskDashboard,
    applyHerdDiseaseFilter,
    applyWardActionFilter,
    populateHerdFilters,
    ageMatchesBand,
    renderWardDiseaseDistribution,
    renderWardDailyReport,
    openHorseDetail,
    updateHealthRecordsSummary,
    roundTempC,
    formatTemp,
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindUi();
    bootstrapIfLoggedIn();
  });
})(window);
