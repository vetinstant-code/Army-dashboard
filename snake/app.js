(function () {
  const D = window.SnakeZooData;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const navLinks = $$("#sidebar-nav a[data-screen]");
  const screens = $$(".screen");
  const overlay = $("#modal-overlay");
  const toastEl = $("#toast");
  const searchInput = $("#global-search");
  const searchResults = $("#search-results");

  let activeScreen = "dashboard";
  let activeFilter = null;
  let healthFilter = "all";

  const statusLabel = { stable: "Stable", warn: "Low Humidity", crit: "Critical" };

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  function setActiveScreen(screenId, filter = null) {
    closeModal();
    activeScreen = screenId;
    activeFilter = filter;
    document.body.classList.toggle("enc-detail-mode", screenId === "enclosure-detail");
    screens.forEach((s) => s.classList.toggle("active", s.id === screenId));
    navLinks.forEach((a) => {
      const encDetail = screenId === "enclosure-detail" && a.dataset.screen === "enclosures";
      a.classList.toggle("active", a.dataset.screen === screenId || encDetail);
    });
    location.hash = screenId;
    renderScreen(screenId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEnclosureDetail(id) {
    setActiveScreen("enclosure-detail");
    requestAnimationFrame(() => {
      if (window.EnclosureDetail?.render) window.EnclosureDetail.render(id);
    });
  }

  function openModal(type, id) {
    const modal = $(`#modal-${type}`);
    if (!modal || !overlay) return;
    $$(".modal-panel").forEach((m) => m.classList.remove("open"));
    if (type === "enclosure") fillEnclosureModal(id);
    if (type === "snake") fillSnakeModal(id);
    if (type === "alert") fillAlertModal(id);
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay?.classList.remove("open");
    overlay?.setAttribute("aria-hidden", "true");
    $$(".modal-panel").forEach((m) => m.classList.remove("open"));
    document.body.style.overflow = "";
  }

  function fillEnclosureModal(id) {
    const e = D.enclosures.find((x) => x.id === id);
    if (!e) return;
    $("#modal-enclosure-title").textContent = e.id;
    $("#modal-enclosure-species").textContent = e.species;
    $("#modal-enclosure-snake").textContent = e.snakeId;
    $("#modal-enclosure-temp").textContent = `${e.temp}°C`;
    $("#modal-enclosure-humidity").textContent = `${e.humidity}%`;
    $("#modal-enclosure-status").textContent = statusLabel[e.status] || e.status;
    $("#modal-enclosure-status").className = `status-pill ${e.status}`;
    $("#modal-rgb-img").src = e.rgb;
    $("#modal-thermal-img").src = e.thermal;
    const snake = D.snakes.find((s) => s.enclosure === id);
    $("#modal-open-snake").dataset.id = snake?.id || "";
    $("#modal-open-snake").style.display = snake ? "inline-flex" : "none";
  }

  function fillSnakeModal(id) {
    const s = D.snakes.find((x) => x.id === id);
    if (!s) return;
    $("#modal-snake-title").textContent = s.name;
    $("#modal-snake-meta").textContent = `${s.species} · ${s.enclosure}`;
    $("#modal-snake-health").textContent = s.health;
    $("#modal-snake-health").className = `status-pill ${s.health === "healthy" ? "stable" : s.health === "critical" ? "crit" : "warn"}`;
    const digestRow = $("#modal-snake-digest-row");
    if (s.digest != null) {
      digestRow.hidden = false;
      $("#modal-snake-digest-bar").style.width = `${s.digest}%`;
      $("#modal-snake-digest-pct").textContent = `${s.digest}%`;
      $("#modal-snake-fed").textContent = `Fed ${s.fed} · ${s.prey}`;
      if (s.rgb) $("#modal-snake-rgb").src = s.rgb;
      if (s.thermal) $("#modal-snake-thermal").src = s.thermal;
      $("#modal-snake-stalled").hidden = !s.stalled;
    } else {
      digestRow.hidden = true;
    }
    $("#modal-open-enclosure").dataset.id = s.enclosure;
  }

  function fillAlertModal(id) {
    const a = D.alerts.find((x) => x.id === id);
    if (!a) return;
    $("#modal-alert-title").textContent = a.title;
    $("#modal-alert-detail").textContent = a.detail;
    $("#modal-alert-time").textContent = a.time;
    $("#modal-alert-level").textContent = a.level;
    $("#modal-alert-level").className = `status-pill ${a.level === "critical" ? "crit" : "warn"}`;
    $("#modal-ack-btn").dataset.id = a.id;
    $("#modal-ack-btn").textContent = a.ack ? "Acknowledged" : "Acknowledge alert";
    $("#modal-ack-btn").disabled = a.ack;
    const goEnc = $("#modal-alert-goto-enclosure");
    const goSnake = $("#modal-alert-goto-snake");
    if (a.enclosure) {
      goEnc.hidden = false;
      goEnc.dataset.id = a.enclosure;
    } else goEnc.hidden = true;
    if (a.snake) {
      goSnake.hidden = false;
      goSnake.dataset.id = a.snake;
    } else goSnake.hidden = true;
  }

  function renderScreen(id) {
    const meta = D.screenMeta[id];
    const screen = document.getElementById(id);
    if (screen && meta && id !== "dashboard") {
      const t = screen.querySelector(".screen-title");
      const s = screen.querySelector(".screen-sub");
      if (t) t.textContent = meta.title;
      if (s) s.textContent = D.getScreenSub ? D.getScreenSub(id) : meta.sub || "";
    }

    if (id === "enclosures") renderEnclosures();
    if (id === "animals") renderAnimals();
    if (id === "digestion") renderDigestion();
    if (id === "alerts") renderAlerts();
    if (id === "health") renderHealth();
    if (id === "breeding") renderBreeding();
    if (id === "feeding") renderFeeding();
    if (id === "environment") renderEnvironment();
    if (id === "reports") renderReports();
    if (id === "settings") renderSettings();
  }

  function renderEnclosures() {
    const el = $("#enclosures-table-body");
    if (!el) return;
    let rows = D.enclosures;
    const stats = facilityStats();
    const sub = $("#enclosures .screen-sub");
    if (activeFilter === "warn") rows = rows.filter((e) => e.status !== "stable");
    if (sub && stats) {
      sub.textContent = activeFilter === "warn"
        ? `${rows.length} need attention · ${stats.totalEnclosures} total`
        : D.getScreenSub("enclosures");
    }
    el.innerHTML = rows
      .map(
        (e) => `
      <tr class="clickable" data-open="enclosure" data-id="${e.id}">
        <td><strong>${e.id}</strong></td>
        <td>${e.species}</td>
        <td>${e.snakeId}</td>
        <td>${e.temp}°C</td>
        <td>${e.humidity}%</td>
        <td><span class="status-dot ${e.status}"></span>${statusLabel[e.status]}</td>
        <td><button type="button" class="btn-sm" data-open="enclosure" data-id="${e.id}">Open</button></td>
      </tr>`
      )
      .join("");
  }

  function renderAnimals() {
    const el = $("#animals-grid");
    if (!el) return;
    let list = D.snakes;
    const stats = facilityStats();
    const q = ($("#animals-filter")?.value || "").toLowerCase();
    if (q) list = list.filter((s) => `${s.name} ${s.id} ${s.species}`.toLowerCase().includes(q));
    if (activeFilter === "healthy") list = list.filter((s) => s.health === "healthy");
    if (activeFilter === "digesting") list = list.filter((s) => s.digest != null);
    const sub = $("#animals .screen-sub");
    if (sub && stats) {
      if (activeFilter === "healthy") {
        sub.textContent = `${list.length} healthy profiles shown · ${stats.healthy} healthy facility-wide`;
      } else if (activeFilter === "digesting") {
        sub.textContent = `${list.length} trackers shown · ${stats.digesting} digesting facility-wide`;
      } else if (D.getScreenSub) {
        sub.textContent = D.getScreenSub("animals");
      }
    }
    el.innerHTML = list
      .map(
        (s) => `
      <article class="animal-card clickable" data-open="snake" data-id="${s.id}">
        <div class="animal-card-top">
          <strong>${s.name}</strong>
          <span class="status-pill ${s.health === "healthy" ? "stable" : s.health === "critical" ? "crit" : "warn"}">${s.health}</span>
        </div>
        <p>${s.species} · ${s.enclosure}</p>
        ${s.digest != null ? `<div class="progress-bar"><span style="width:${s.digest}%"></span></div><small>Digestion ${s.digest}%</small>` : `<small>${s.breeding || "Routine monitoring"}</small>`}
      </article>`
      )
      .join("");
  }

  function renderDigestion() {
    const el = $("#digestion-full-list");
    if (!el) return;
    const list = D.snakes.filter((s) => s.digest != null);
    el.innerHTML = list
      .map(
        (s) => `
      <div class="digest-item clickable" data-open="snake" data-id="${s.id}">
        <img class="snake-thumb" src="${s.rgb}" alt="" />
        <div>
          <h5>${s.name}</h5>
          <p>Fed ${s.fed} · ${s.prey}</p>
          <div class="progress-bar"><span style="width:${s.digest}%"></span></div>
        </div>
        <div class="thermal-thumb">
          <img src="${s.thermal}" alt="" />
          <span class="thermal-label ${s.stalled ? "warn" : ""}">${s.stalled ? "Stalled" : s.digest + "%"}</span>
        </div>
      </div>`
      )
      .join("");
  }

  function renderAlerts() {
    const el = $("#alerts-full-list");
    if (!el) return;
    let list = D.alerts;
    if (activeFilter === "active") list = list.filter((a) => !a.ack);
    el.innerHTML = list
      .map(
        (a) => `
      <div class="alert-item ${a.level} clickable ${a.ack ? "acked" : ""}" data-open="alert" data-id="${a.id}">
        <strong>${a.title}</strong>
        <small>${a.detail} · ${a.time}</small>
        ${a.ack ? '<span class="ack-tag">Acknowledged</span>' : ""}
      </div>`
      )
      .join("");
    updateAlertBadge();
  }

  function snakeName(id) {
    return D.snakes.find((s) => s.id === id)?.name || id;
  }

  function filterHealthRecords() {
    let list = D.healthRecords || [];
    if (healthFilter === "critical") list = list.filter((r) => r.status === "critical");
    else if (healthFilter === "at-risk") list = list.filter((r) => r.status === "at-risk");
    else if (["thermal", "resp", "digest", "chronic", "shed"].includes(healthFilter)) {
      list = list.filter((r) => r.risk === healthFilter);
    }
    return list;
  }

  function riskLabel(key) {
    const map = { thermal: "Thermal", resp: "Respiratory", digest: "Digestive", chronic: "Chronic", shed: "Shedding" };
    return map[key] || key;
  }

  function trendLabel(trend) {
    if (trend === "improving") return '<span class="trend up">Improving</span>';
    if (trend === "worsening") return '<span class="trend down">Worsening</span>';
    return '<span class="trend flat">Stable</span>';
  }

  function facilityStats() {
    return D.getStats ? D.getStats() : null;
  }

  function renderHealth() {
    if (activeFilter && D.risks?.some((r) => r.key === activeFilter)) {
      healthFilter = activeFilter;
      activeFilter = null;
      $$("#health-filters .filter-chip").forEach((c) => {
        c.classList.toggle("active", c.dataset.healthFilter === healthFilter);
      });
    }

    const stats = facilityStats();
    const records = filterHealthRecords();

    const kpis = $("#health-kpis");
    if (kpis && stats) {
      kpis.innerHTML = `
        <div class="health-kpi green"><span class="health-kpi-val">${stats.healthy}</span><span class="health-kpi-lbl">Healthy <em>${stats.healthyPct}%</em></span></div>
        <div class="health-kpi orange"><span class="health-kpi-val">${stats.monitoring}</span><span class="health-kpi-lbl">At risk</span></div>
        <div class="health-kpi red"><span class="health-kpi-val">${stats.criticalCases}</span><span class="health-kpi-lbl">Critical</span></div>
        <div class="health-kpi blue"><span class="health-kpi-val">${stats.checkupsToday}</span><span class="health-kpi-lbl">Checkups <em>${stats.checkupsCompleted} done</em></span></div>
      `;
    }

    const risksPanel = $("#health-risks-panel");
    if (risksPanel) {
      risksPanel.innerHTML = D.risks
        .map(
          (r) => `
        <button type="button" class="health-risk-chip ${r.key} health-risk-pick" data-health-filter="${r.key}">
          <span class="health-risk-chip-label">${r.label}</span>
          <span class="health-risk-chip-count">${r.count}</span>
        </button>`
        )
        .join("");
    }

    const summary = $("#health-facility-summary");
    if (summary && stats) {
      summary.innerHTML = `
        <li><span>Snakes</span><strong>${stats.totalSnakes}</strong></li>
        <li><span>Open cases</span><strong>${stats.activeCases}</strong></li>
        <li><span>Not healthy</span><strong>${stats.notHealthy}</strong></li>
        <li><span>Rounds</span><strong>09:00</strong></li>
      `;
    }

    const countEl = $("#health-case-count");
    if (countEl) {
      const shown = records.length;
      const total = stats?.activeCases ?? D.healthRecords.length;
      countEl.textContent =
        healthFilter === "all" ? `${shown} of ${total} cases` : `${shown} shown`;
    }

    const list = $("#health-cases-list");
    if (list) {
      list.innerHTML = records.length
        ? records
            .map((r) => {
              const name = snakeName(r.snakeId);
              const pill = r.status === "critical" ? "crit" : "warn";
              return `
          <article class="health-case-card clickable" data-open="snake" data-id="${r.snakeId}">
            <div class="health-case-main">
              <div class="health-case-id">
                <strong>${name}</strong>
                <span class="health-case-meta">${r.snakeId} · ${r.enclosure}</span>
              </div>
              <div class="health-case-badges">
                <span class="status-pill ${pill}">${r.status}</span>
                <span class="risk-tag ${r.risk}">${riskLabel(r.risk)}</span>
                ${trendLabel(r.trend)}
              </div>
            </div>
            <p class="health-case-diag">${r.diagnosis}</p>
            <div class="health-case-tags">
              <span>${r.vitals.weight}</span>
              <span>${r.vitals.respiration}</span>
              <span>${r.vitals.shed}</span>
            </div>
            <div class="health-case-foot">
              <span>${r.vet} · ${r.lastExam}</span>
              <span class="health-case-action">View record →</span>
            </div>
          </article>`;
            })
            .join("")
        : `<p class="health-empty">No cases match this filter.</p>`;
    }

    const timeline = $("#health-timeline");
    if (timeline && D.healthTimeline) {
      timeline.innerHTML = D.healthTimeline.map(
        (e) => `
        <div class="health-log-item ${e.level}">
          <span class="health-log-dot"></span>
          <div>
            <time>${e.time}</time>
            <p>${e.text}</p>
          </div>
        </div>`
      ).join("");
    }
  }

  function renderBreeding() {
    const el = $("#breeding-table-body");
    if (!el) return;
    const rows = D.snakes.filter((s) => s.breeding);
    el.innerHTML = rows
      .map(
        (s) => `
      <tr class="clickable" data-open="snake" data-id="${s.id}">
        <td>${s.id}</td>
        <td>${s.species}</td>
        <td>${s.breeding}</td>
        <td>${s.estDate}</td>
      </tr>`
      )
      .join("");
  }

  function renderFeeding() {
    const el = $("#feeding-full-calendar");
    if (!el) return;
    el.innerHTML = D.feedingWeek
      .map(
        (d) => `
      <div class="feed-day ${d.count > 25 ? "peak" : ""}">
        <strong>${d.day}</strong>
        <span class="count">${d.count}</span>
        <small>${d.note}</small>
      </div>`
      )
      .join("");
  }

  function renderEnvironment() {
    const el = $("#environment-zones");
    if (!el) return;
    el.innerHTML = D.enclosures.map(
      (e) => `
      <div class="zone-card clickable" data-open="enclosure" data-id="${e.id}">
        <h4>${e.id}</h4>
        <p>${e.species}</p>
        <div class="zone-stats">
          <span>${e.temp}°C</span>
          <span>${e.humidity}% RH</span>
        </div>
        <span class="status-pill ${e.status}">${statusLabel[e.status]}</span>
      </div>`
    ).join("");
  }

  function renderReports() {
    /* static buttons wired in init */
  }

  function renderSettings() {
    /* static form wired in init */
  }

  function syncKpiCards() {
    const k = D.kpis;
    const stats = facilityStats();
    if (!k || !stats) return;
    const pairs = [
      [".kpi-card.green h3", k.snakes],
      [".kpi-card.blue h3", k.enclosures],
      [".kpi-card.purple h3", k.healthy],
      [".kpi-card.orange h3", k.digesting],
      [".kpi-card.teal h3", k.breeding],
      [".kpi-card.pink h3", k.feedingToday],
      [".kpi-card.red h3", stats.alertsUnacked],
    ];
    pairs.forEach(([sel, val]) => $$(sel).forEach((el) => (el.textContent = val)));

    const healthySub = $(".kpi-card.purple .kpi-sub");
    if (healthySub) healthySub.textContent = `${stats.healthyPct}% of total`;
    const digestSub = $(".kpi-card.orange .kpi-sub");
    if (digestSub) digestSub.textContent = `${Math.round((k.digesting / k.snakes) * 1000) / 10}% of total`;
    const feedSub = $(".kpi-card.pink .kpi-sub");
    if (feedSub) feedSub.textContent = `${Math.round((k.feedingToday / k.snakes) * 1000) / 10}% of total`;
    const alertSub = $(".kpi-card.red .kpi-sub");
    if (alertSub) alertSub.textContent = `${stats.alertsTotal} total in queue`;

    const facility = $(".facility-grid");
    if (facility) {
      const cells = $$(".facility-grid strong");
      if (cells[0]) cells[0].textContent = k.enclosures;
      if (cells[1]) cells[1].textContent = k.snakes;
      if (cells[3]) cells[3].textContent = stats.alertsUnacked;
    }
    const speciesEl = $("#facility-species-count");
    if (speciesEl) speciesEl.textContent = stats.speciesCount;
    const facilityAlerts = $("#facility-alerts-count");
    if (facilityAlerts) facilityAlerts.textContent = stats.alertsUnacked;
    const staffEl = $("#facility-staff-count");
    if (staffEl) staffEl.textContent = stats.staffOnDuty;
  }

  function syncDashboardWidgets() {
    const encBody = $("#dash-enc-tbody");
    if (encBody) {
      encBody.innerHTML = D.enclosures
        .slice(0, 6)
        .map(
          (e) => `
        <tr class="clickable" data-open="enclosure" data-id="${e.id}">
          <td>${e.id}</td>
          <td>${e.species}</td>
          <td>${e.temp}°C</td>
          <td>${e.humidity}%</td>
          <td><span class="status-dot ${e.status}"></span>${statusLabel[e.status]}</td>
        </tr>`
        )
        .join("");
    }

    const digestEl = $("#dash-digest-list");
    if (digestEl) {
      const list = D.snakes.filter((s) => s.digest != null);
      digestEl.innerHTML = list
        .map(
          (s) => `
        <div class="digest-item clickable" data-open="snake" data-id="${s.id}">
          <img class="snake-thumb" src="${s.rgb}" alt="" />
          <div>
            <h5>${s.name}</h5>
            <p>Fed ${s.fed} · ${s.prey}</p>
            <div class="progress-bar"><span style="width:${s.digest}%"></span></div>
          </div>
          <div class="thermal-thumb">
            <img src="${s.thermal}" alt="" />
            <span class="thermal-label ${s.stalled ? "warn" : ""}">${s.stalled ? "Stalled" : s.digest + "%"}</span>
          </div>
        </div>`
        )
        .join("");
    }

    const breedBody = $("#dash-breed-tbody");
    if (breedBody) {
      const rows = D.snakes.filter((s) => s.breeding);
      breedBody.innerHTML = rows
        .map(
          (s) => `
        <tr class="clickable" data-open="snake" data-id="${s.id}">
          <td>${s.id}</td>
          <td>${s.species}</td>
          <td>${s.breeding}</td>
          <td>${s.estDate || "—"}</td>
        </tr>`
        )
        .join("");
    }

    const breedPills = $("#dash-breed-pills");
    if (breedPills && D.kpis.breedingBreakdown) {
      const b = D.kpis.breedingBreakdown;
      breedPills.innerHTML = `
        <span class="breed-pill">Gravid ${b.gravid}</span>
        <span class="breed-pill">Pre-Ovulation ${b.preOvulation}</span>
        <span class="breed-pill">Breeding Active ${b.breedingActive}</span>`;
    }

    const feedCal = $("#dash-feed-calendar");
    if (feedCal) {
      feedCal.innerHTML = D.feedingWeek
        .map(
          (d) => `
        <div class="feed-day clickable" data-nav-feed="1">
          <strong>${d.day}</strong><span class="count">${d.count}</span><small>${d.note}</small>
        </div>`
        )
        .join("");
      $$("#dash-feed-calendar .feed-day").forEach((day) => {
        day.addEventListener("click", () => setActiveScreen("feeding"));
      });
    }

    const actList = $("#dash-activity-list");
    if (actList) {
      actList.innerHTML = (D.getActivityLog ? D.getActivityLog() : D.activities)
        .slice(0, 5)
        .map(
          (a) => `
        <div class="activity-item activity-item-${a.level || "info"}">
          <div>${a.text}</div>
          <span>${a.time}</span>
        </div>`
        )
        .join("");
    }
  }

  function activityLevelDot(level) {
    if (level === "critical") return "critical";
    if (level === "warning") return "warning";
    return "info";
  }

  function openActivityLogModal() {
    const modal = $("#modal-activity");
    const list = $("#modal-activity-list");
    if (!modal || !list || !overlay) return;
    const entries = D.getActivityLog ? D.getActivityLog() : [];
    list.innerHTML = entries.length
      ? entries
          .map(
            (a) => `
        <div class="activity-log-row activity-log-${activityLevelDot(a.level)}">
          <span class="activity-log-dot" aria-hidden="true"></span>
          <div class="activity-log-text">${a.text}</div>
          <span class="activity-log-time">${a.time}</span>
        </div>`
          )
          .join("")
      : '<p class="activity-log-empty">No activity recorded.</p>';
    $$(".modal-panel").forEach((m) => m.classList.remove("open"));
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function openRiskCategory(r) {
    if (!r) return;
    if (r.screen === "health") {
      healthFilter = r.key;
      $$("#health-filters .filter-chip").forEach((c) => {
        c.classList.toggle("active", c.dataset.healthFilter === r.key);
      });
      setActiveScreen("health");
      renderHealth();
      return;
    }
    if (r.screen === "digestion") {
      setActiveScreen("digestion");
      return;
    }
    setActiveScreen(r.screen || "health");
  }

  function syncDashboardRiskCards() {
    const container = $("#dashboard-risk-cards");
    if (!container || !D.risks) return;
    container.innerHTML = D.risks
      .map(
        (r) => `
      <article class="risk-card theme-${r.theme || r.key}" data-risk-key="${r.key}">
        <div class="risk-card-icon" aria-hidden="true">
          <img src="assets/icons/${r.icon || "risk-" + r.key + ".svg"}" alt="" width="28" height="28" decoding="async" />
        </div>
        <h4 class="risk-card-title">${r.label}</h4>
        <div class="risk-card-count">${r.count}</div>
        <div class="risk-card-actions">
          <p class="risk-card-status">At Risk</p>
          <button type="button" class="risk-card-btn" data-risk-key="${r.key}">View Details</button>
        </div>
      </article>`
      )
      .join("");
  }

  function alertSeverityLabel(level) {
    if (level === "critical") return "Critical";
    if (level === "warning") return "Warning";
    return "Info";
  }

  function alertSeverityIcon(level) {
    if (level === "critical") return "⚠";
    if (level === "warning") return "△";
    return "ℹ";
  }

  function syncDashboardAlerts() {
    const list = $(".alert-list-dashboard") || $("#dashboard .alert-list");
    if (!list) return;
    list.innerHTML = D.alerts
      .slice(0, 6)
      .map(
        (a) => `
      <div class="alert-item alert-item-row ${a.level} clickable ${a.ack ? "acked" : ""}" data-open="alert" data-id="${a.id}">
        <span class="alert-row-icon" aria-hidden="true">${alertSeverityIcon(a.level)}</span>
        <div class="alert-row-body">
          <strong>${a.title}</strong>
          <small>${a.detail}</small>
          <span class="alert-row-time">${a.time}</span>
        </div>
        <span class="alert-row-tag">${alertSeverityLabel(a.level)}</span>
      </div>`
      )
      .join("");
  }

  function updateAlertBadge() {
    const stats = facilityStats();
    const n = stats?.alertsUnacked ?? D.alerts.filter((a) => !a.ack).length;
    $$(".notify-badge, .nav-badge").forEach((b) => {
      b.textContent = n;
      b.style.display = n ? "" : "none";
    });
    syncKpiCards();
  }

  function runSearch(q) {
    if (!searchResults) return;
    q = q.trim().toLowerCase();
    if (!q) {
      searchResults.classList.remove("open");
      searchResults.innerHTML = "";
      return;
    }
    const hits = [];
    D.enclosures.forEach((e) => {
      if (`${e.id} ${e.species}`.toLowerCase().includes(q)) hits.push({ type: "enclosure", id: e.id, label: `Enclosure ${e.id}`, sub: e.species });
    });
    D.snakes.forEach((s) => {
      if (`${s.id} ${s.name} ${s.species}`.toLowerCase().includes(q)) hits.push({ type: "snake", id: s.id, label: s.name, sub: s.enclosure });
    });
    D.alerts.forEach((a) => {
      if (a.title.toLowerCase().includes(q)) hits.push({ type: "alert", id: a.id, label: a.title, sub: a.time });
    });
    searchResults.innerHTML = hits
      .slice(0, 8)
      .map((h) => `<button type="button" class="search-hit" data-open="${h.type}" data-id="${h.id}"><strong>${h.label}</strong><span>${h.sub}</span></button>`)
      .join(hits.length ? "" : '<p class="search-empty">No results</p>');
    searchResults.classList.add("open");
  }

  function acknowledgeAlert(id) {
    const a = D.alerts.find((x) => x.id === id);
    if (!a || a.ack) return;
    a.ack = true;
    toast("Alert acknowledged");
    renderAlerts();
    syncDashboardAlerts();
    updateAlertBadge();
    closeModal();
  }

  function camStatusDotClass(status) {
    if (status === "stable") return "stable";
    if (status === "crit") return "crit";
    return "warn";
  }

  function renderCameraGrid() {
    const grid = $("#camera-grid");
    if (!grid) return;
    const order = [
      "PY-101",
      "COB-022",
      "BOA-015",
      "RET-008",
      "COR-044",
      "VIP-015",
      "PY-088",
      "BOA-028",
      "VIP-022",
      "COR-012",
      "RET-012",
      "COB-031",
    ];
    const all = D.getLiveCameras ? D.getLiveCameras() : D.enclosures;
    const cams = order.map((id) => all.find((e) => e.id === id)).filter(Boolean);
    const fill = all.filter((e) => !order.includes(e.id));
    const list = [...cams, ...fill].slice(0, 12);

    grid.innerHTML = list
      .map(
        (e) => `
      <div class="cam-tile clickable" data-open="enclosure" data-id="${e.id}" title="${e.species} · ${e.snakeId}">
        <img src="${e.rgb}" alt="RGB ${e.id}" loading="lazy" />
        <span class="cam-label">
          <span class="cam-status-dot ${camStatusDotClass(e.status)}" aria-hidden="true"></span>
          ${e.id}
        </span>
      </div>`
      )
      .join("");
  }

  function wireDashboardClicks() {
    $$(".kpi-card[data-nav]").forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const nav = card.dataset.nav;
        const filter = card.dataset.filter || null;
        setActiveScreen(nav, filter);
      });
    });

    $$(".widget-head a[data-nav], .btn-link[data-nav]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        setActiveScreen(a.dataset.nav, a.dataset.filter || null);
      });
    });

    $("#dashboard-risk-cards")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".risk-card-btn");
      if (!btn) return;
      e.preventDefault();
      const key = btn.dataset.riskKey;
      openRiskCategory(D.risks.find((x) => x.key === key));
    });

    $("#view-activity-log")?.addEventListener("click", (e) => {
      e.preventDefault();
      openActivityLogModal();
    });
    $("#modal-activity-close")?.addEventListener("click", closeModal);
  }

  function delegateClicks() {
    document.addEventListener("click", (e) => {
      const openBtn = e.target.closest("[data-open]");
      if (openBtn) {
        e.preventDefault();
        if (openBtn.dataset.open === "enclosure") {
          openEnclosureDetail(openBtn.dataset.id);
        } else {
          openModal(openBtn.dataset.open, openBtn.dataset.id);
        }
        return;
      }
      const screenBtn = e.target.closest("[data-screen]");
      if (screenBtn && !screenBtn.closest("#sidebar-nav")) {
        e.preventDefault();
        setActiveScreen(screenBtn.dataset.screen, screenBtn.dataset.filter || null);
        return;
      }
      const navCard = e.target.closest(".kpi-card[data-nav]");
      if (navCard) return;
    });

    $$(".modal-close").forEach((btn) => btn.addEventListener("click", closeModal));
    overlay?.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    $("#modal-ack-btn")?.addEventListener("click", () => acknowledgeAlert($("#modal-ack-btn").dataset.id));
    $("#modal-open-snake")?.addEventListener("click", () => {
      const id = $("#modal-open-snake").dataset.id;
      if (id) {
        closeModal();
        openModal("snake", id);
      }
    });
    $("#modal-open-enclosure")?.addEventListener("click", () => {
      closeModal();
      openEnclosureDetail($("#modal-open-enclosure").dataset.id);
    });
    $("#modal-alert-goto-enclosure")?.addEventListener("click", () => {
      closeModal();
      openEnclosureDetail($("#modal-alert-goto-enclosure").dataset.id);
    });
    $("#modal-alert-goto-snake")?.addEventListener("click", () => {
      closeModal();
      openModal("snake", $("#modal-alert-goto-snake").dataset.id);
    });

    $(".notify-btn")?.addEventListener("click", () => setActiveScreen("alerts", "active"));

    searchInput?.addEventListener("input", () => runSearch(searchInput.value));
    searchResults?.addEventListener("click", (e) => {
      const hit = e.target.closest(".search-hit");
      if (hit) {
        openModal(hit.dataset.open, hit.dataset.id);
        searchResults.classList.remove("open");
        searchInput.value = "";
      }
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-box")) searchResults?.classList.remove("open");
    });

    $("#animals-filter")?.addEventListener("input", () => renderAnimals());
    $("#btn-ack-all")?.addEventListener("click", () => {
      D.alerts.forEach((a) => {
        if (!a.ack) a.ack = true;
      });
      toast("All alerts acknowledged");
      renderAlerts();
      syncDashboardAlerts();
      updateAlertBadge();
    });

    $$(".report-btn").forEach((btn) => {
      btn.addEventListener("click", () => toast(`Generating ${btn.dataset.report} report…`));
    });

    $("#save-settings")?.addEventListener("click", () => toast("Settings saved"));

    $$("#health-filters .filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        healthFilter = chip.dataset.healthFilter;
        $$("#health-filters .filter-chip").forEach((c) => c.classList.toggle("active", c === chip));
        renderHealth();
      });
    });

    document.addEventListener("click", (e) => {
      const riskPick = e.target.closest(".health-risk-pick");
      if (riskPick) {
        healthFilter = riskPick.dataset.healthFilter;
        $$("#health-filters .filter-chip").forEach((c) => {
          c.classList.toggle("active", c.dataset.healthFilter === healthFilter);
        });
        renderHealth();
      }
    });

    $("#health-export")?.addEventListener("click", () => toast("Health report PDF queued for export"));
  }

  function initNav() {
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        setActiveScreen(link.dataset.screen);
      });
    });
    const hash = location.hash.replace("#", "");
    if (hash && D.screenMeta[hash]) setActiveScreen(hash);
  }

  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("snake-zoo-theme", t);
    const meta = document.getElementById("meta-theme-color");
    if (meta) meta.setAttribute("content", t === "light" ? "#f3f0e8" : "#080b10");
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", t === "light" ? "Switch to dark mode" : "Switch to light mode");
      btn.title = t === "light" ? "Dark mode" : "Light mode";
    }
    $$('input[name="app-theme"]').forEach((radio) => {
      radio.checked = radio.value === t;
    });
  }

  function initTheme() {
    const saved = localStorage.getItem("snake-zoo-theme");
    if (saved === "light" || saved === "dark") applyTheme(saved);

    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      toast(next === "light" ? "Sandstone theme enabled" : "Midnight theme enabled");
    });

    $$('input[name="app-theme"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) applyTheme(radio.value);
      });
    });
  }

  function initDateTime() {
    const dt = $("#live-datetime");
    if (!dt) return;
    const tick = () => {
      dt.textContent = new Date()
        .toLocaleString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(",", " •");
    };
    tick();
    setInterval(tick, 60000);
  }

  function init() {
    initTheme();
    syncKpiCards();
    syncDashboardWidgets();
    syncDashboardRiskCards();
    syncDashboardAlerts();
    renderCameraGrid();
    wireDashboardClicks();
    delegateClicks();
    initNav();
    initDateTime();
    updateAlertBadge();
    renderScreen(activeScreen);
  }

  window.SnakeApp = { goTo: setActiveScreen, toast, openEnclosure: openEnclosureDetail };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
