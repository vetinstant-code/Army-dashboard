/** Wide enclosure detail — charts, cameras, live refresh */
window.EnclosureDetail = (function () {
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const cToF = (c) => Math.round((c * 9) / 5 + 32);

  function buildDetail(base) {
    const snake = window.SnakeZooData.snakes.find((s) => s.enclosure === base.id);
    const pair = window.SnakeZooData.pairForSpecies(base.species);
    const digest = snake?.digest ?? (base.status === "stable" ? 78 : base.status === "warn" ? 45 : 20);
    const hotF = base.hotSpotF ?? cToF(base.temp);
    const coolF = base.coolZoneF ?? hotF - 12;
    return {
      ...base,
      rgb: pair.rgb,
      thermal: pair.thermal,
      displayId: base.displayId || base.id.replace(/^([A-Z]+)-/, "A-") || base.id,
      scientific: base.scientific || (base.species === "Ball Python" ? "Python regius" : `${base.species}`),
      snakeId: snake?.id || base.snakeId,
      snakeName: snake?.name || base.species,
      age: base.age || "Adult",
      acquired: base.acquired || "May 12, 2020",
      hotSpotF: hotF,
      coolZoneF: coolF,
      humidity: base.humidity,
      weightG: base.weightG ?? snake?.weightG ?? 623,
      weightUpdated: base.weightUpdated || "May 19, 2024",
      hotTarget: "88–92°F",
      coolTarget: "74–78°F",
      humidityTarget: "50–70%",
      digestPct: digest,
      digestNote: digest >= 70 ? "thermal rise detected" : digest < 40 ? "monitor closely" : "progressing normally",
      digestComplete: base.digestComplete || "May 24, 2024",
      digestInfo:
        digest >= 70
          ? "Thermal elevation consistent with active digestion. Continue monitoring."
          : "Digestion below expected thermal curve. Review feeding and ambient temps.",
      tempHistory: genSeries(hotF, 3, 24),
      humidityHistory: genSeries(base.humidity, 8, 24),
    };
  }

  function genSeries(base, variance, n) {
    const out = [];
    let v = base;
    for (let i = 0; i < n; i++) {
      v = base + (Math.sin(i / 3) * variance) / 2 + (Math.random() - 0.5) * variance;
      out.push(Math.round(v * 10) / 10);
    }
    return out;
  }

  let current = null;

  function render(id) {
    const base = window.SnakeZooData.enclosures.find((e) => e.id === id);
    if (!base) return;
    current = buildDetail(base);

    $("enc-title").textContent = `ENCLOSURE ${current.displayId} — ${current.snakeId} ${current.species}`;
    $("enc-chip-species-text").textContent = `${current.species} (${current.scientific})`;
    $("enc-chip-age-text").textContent = current.age;
    $("enc-chip-date-text").textContent = current.acquired;
    $("enc-chip-tag-text").textContent = current.snakeId;

    $("enc-thermal-img").src = current.thermal;
    $("enc-thermal-img").alt = `Thermal ${current.id}`;
    $("enc-rgb-img").src = current.rgb;
    $("enc-rgb-img").alt = `RGB ${current.id}`;
    $("enc-thermal-pin").textContent = `${current.hotSpotF}°F`;
    const fsT = $("enc-fs-thermal");
    const fsR = $("enc-fs-rgb");
    if (fsT) fsT.dataset.src = current.thermal;
    if (fsR) fsR.dataset.src = current.rgb;
    const wu = $("enc-weight-updated");
    if (wu) wu.textContent = `Last updated: ${current.weightUpdated}`;

    $("enc-hot-val").textContent = `${current.hotSpotF}°F`;
    $("enc-cool-val").textContent = `${current.coolZoneF}°F`;
    $("enc-hum-val").textContent = `${current.humidity}%`;
    $("enc-weight-val").textContent = `${current.weightG}g`;

    $("enc-digest-title").textContent = `Digesting ${current.digestPct}% — ${current.digestNote}`;
    $("enc-digest-bar").style.width = `${current.digestPct}%`;
    $("enc-digest-eta").textContent = `Estimated completion: ${current.digestComplete}`;
    $("enc-digest-info").textContent = current.digestInfo;

    const now = new Date();
    $("enc-data-time").textContent = `Data from ${now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })}`;

    scheduleCharts();
  }

  const chartOpts = {
    temp: { color: "#dc2626", targetMin: 88, targetMax: 92, label: "°F", title: "Hot Spot" },
    humidity: { color: "#2563eb", targetMin: 50, targetMax: 70, label: "%", title: "Humidity" },
  };

  function scheduleCharts() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => drawAllCharts());
    });
  }

  function drawAllCharts() {
    if (!current) return;
    const t = drawChart("chart-temp", current.tempHistory, chartOpts.temp);
    const h = drawChart("chart-humidity", current.humidityHistory, chartOpts.humidity);
    if (!t || !h) setTimeout(drawAllCharts, 80);
  }

  function drawChart(canvasId, data, opts) {
    const canvas = $(canvasId);
    const wrap = canvas?.parentElement;
    const tip = wrap?.querySelector(".enc-chart-tooltip");
    if (!canvas || !wrap || !data?.length) return false;

    const dpr = window.devicePixelRatio || 1;
    const rect = wrap.getBoundingClientRect();
    let w = rect.width;
    let h = rect.height;
    if (w < 24 || h < 24) {
      w = wrap.clientWidth || 400;
      h = wrap.clientHeight || 200;
    }
    if (w < 24 || h < 24) return false;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const pad = { t: 16, r: 16, b: 28, l: 40 };
    const plotW = w - pad.l - pad.r;
    const plotH = h - pad.t - pad.b;

    const min = Math.min(...data, opts.targetMin) - 2;
    const max = Math.max(...data, opts.targetMax) + 2;
    const range = max - min || 1;

    const xAt = (i) => pad.l + (i / (data.length - 1)) * plotW;
    const yAt = (v) => pad.t + plotH - ((v - min) / range) * plotH;

    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = "#252d3d";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (plotH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + plotW, y);
      ctx.stroke();
    }

    // target band
    const yTop = yAt(opts.targetMax);
    const yBot = yAt(opts.targetMin);
    ctx.fillStyle = "rgba(139, 155, 180, 0.1)";
    ctx.fillRect(pad.l, yTop, plotW, yBot - yTop);
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "#4d5d78";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, yAt(opts.targetMax));
    ctx.lineTo(pad.l + plotW, yAt(opts.targetMax));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad.l, yAt(opts.targetMin));
    ctx.lineTo(pad.l + plotW, yAt(opts.targetMin));
    ctx.stroke();
    ctx.setLineDash([]);

    // fill under line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = xAt(i);
      const y = yAt(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(xAt(data.length - 1), pad.t + plotH);
    ctx.lineTo(xAt(0), pad.t + plotH);
    ctx.closePath();
    ctx.fillStyle = opts.color === "#dc2626" ? "rgba(220, 38, 38, 0.12)" : "rgba(37, 99, 235, 0.12)";
    ctx.fill();

    // trend line
    ctx.strokeStyle = opts.color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = xAt(i);
      const y = yAt(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // points on line
    data.forEach((v, i) => {
      if (i % 4 !== 0 && i !== data.length - 1) return;
      ctx.beginPath();
      ctx.arc(xAt(i), yAt(v), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#161b26";
      ctx.fill();
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // y labels
    ctx.fillStyle = "#8b9bb4";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const val = max - (range * i) / 4;
      ctx.fillText(Math.round(val) + opts.label, pad.l - 6, pad.t + (plotH * i) / 4 + 3);
    }

    canvas.onmousemove = (e) => {
      const b = canvas.getBoundingClientRect();
      const mx = e.clientX - b.left - pad.l;
      const idx = Math.round((mx / plotW) * (data.length - 1));
      const i = Math.max(0, Math.min(data.length - 1, idx));
      if (!tip) return;
      tip.classList.add("show");
      tip.textContent = `${opts.title}: ${data[i]}${opts.label} · ${24 - i}h ago`;
      tip.style.left = `${xAt(i)}px`;
      tip.style.top = `${yAt(data[i]) - 36}px`;
    };
    canvas.onmouseleave = () => tip?.classList.remove("show");

    // x-axis time labels
    ctx.fillStyle = "#8b9bb4";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    const hours = ["24h", "18h", "12h", "6h", "Now"];
    hours.forEach((label, i) => {
      const x = pad.l + (plotW * i) / (hours.length - 1);
      ctx.fillText(label, x, h - 8);
    });

    return true;
  }

  function refresh() {
    if (!current) return;
    current.tempHistory = genSeries(current.hotSpotF, 3, 24);
    current.humidityHistory = genSeries(current.humidity, 6, 24);
    drawAllCharts();
    const now = new Date();
    $("enc-data-time").textContent = `Data from ${now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  function bindUi() {
    $("enc-back")?.addEventListener("click", () => {
      document.body.classList.remove("enc-detail-mode");
      if (window.SnakeApp?.goTo) window.SnakeApp.goTo("enclosures");
    });

    $("enc-refresh")?.addEventListener("click", () => {
      const btn = $("enc-refresh");
      btn?.classList.add("spin");
      refresh();
      setTimeout(() => btn?.classList.remove("spin"), 800);
      if (window.SnakeApp?.toast) window.SnakeApp.toast("Sensor data refreshed");
    });

    const fs = $("enc-fs-overlay");
    $$(".enc-fs-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const src = btn.dataset.src;
        const img = $("enc-fs-image");
        if (img && src) {
          img.src = src;
          fs?.classList.add("open");
        }
      });
    });
    $("enc-fs-close")?.addEventListener("click", () => fs?.classList.remove("open"));
    fs?.addEventListener("click", (e) => {
      if (e.target === fs) fs.classList.remove("open");
    });

    window.addEventListener("resize", () => {
      if (current) drawAllCharts();
    });

    const detailScreen = document.getElementById("enclosure-detail");
    if (detailScreen && typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        if (detailScreen.classList.contains("active") && current) drawAllCharts();
      });
      ro.observe(detailScreen);
    }
  }

  bindUi();

  return { render, refresh, redraw: drawAllCharts };
})();
