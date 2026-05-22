/** Mock data for Snake Zoo interactive demo */
const cameraPairs = {
  ballPython: {
    rgb: "assets/images/enc-rgb-ball-python.png",
    thermal: "assets/thermal/enc-thermal-ball-python.png",
  },
  boa: {
    rgb: "assets/images/enc-rgb-boa.png",
    thermal: "assets/thermal/enc-thermal-boa.png",
  },
  viper: {
    rgb: "assets/images/enc-rgb-viper.png",
    thermal: "assets/thermal/enc-thermal-viper.png",
  },
  cobra: {
    rgb: "assets/images/enc-rgb-cobra.png",
    thermal: "assets/thermal/enc-thermal-cobra.png",
  },
  corn: {
    rgb: "assets/images/enc-rgb-corn.png",
    thermal: "assets/thermal/enc-thermal-corn.png",
  },
  retic: {
    rgb: "assets/images/enc-rgb-retic.png",
    thermal: "assets/thermal/enc-thermal-retic.png",
  },
};

function pairForSpecies(species) {
  const key = {
    "Ball Python": "ballPython",
    Boa: "boa",
    Viper: "viper",
    "King Cobra": "cobra",
    "Corn Snake": "corn",
    Reticulated: "retic",
  }[species];
  return cameraPairs[key] || cameraPairs.ballPython;
}

function applyCameraPair(item) {
  const pair = pairForSpecies(item.species);
  return { ...item, rgb: pair.rgb, thermal: pair.thermal };
}

window.SnakeZooData = {
  cameraPairs,
  pairForSpecies,
  applyCameraPair,

  kpis: {
    snakes: 78,
    enclosures: 32,
    healthy: 72,
    digesting: 18,
    breeding: 14,
    feedingToday: 19,
    staffOnDuty: 6,
    breedingBreakdown: { gravid: 14, preOvulation: 6, breedingActive: 5 },
  },

  enclosures: [
    {
      id: "PY-101",
      displayId: "A-104",
      species: "Ball Python",
      scientific: "Python regius",
      snakeId: "SN-033",
      temp: 31.2,
      humidity: 58,
      status: "stable",
      hotSpotF: 88,
      coolZoneF: 76,
      weightG: 623,
      weightUpdated: "May 19, 2024",
      acquired: "May 12, 2020",
    },
    { id: "COB-022", species: "King Cobra", snakeId: "SN-041", temp: 29.8, humidity: 58, status: "warn", weightG: 5200 },
    { id: "BOA-015", species: "Boa", snakeId: "SN-091", temp: 32.1, humidity: 75, status: "stable", weightG: 4200 },
    { id: "RET-008", species: "Reticulated", snakeId: "SN-052", temp: 33.4, humidity: 68, status: "stable", weightG: 14800 },
    { id: "COR-044", species: "Corn Snake", snakeId: "SN-114", temp: 28.5, humidity: 45, status: "crit", weightG: 412 },
    { id: "VIP-015", species: "Viper", snakeId: "SN-015", temp: 30.1, humidity: 62, status: "warn", weightG: 890 },
    { id: "PY-088", species: "Ball Python", snakeId: "SN-077", temp: 30.8, humidity: 55, status: "stable", weightG: 540 },
    { id: "BOA-028", species: "Boa", snakeId: "SN-102", temp: 31.5, humidity: 70, status: "stable", weightG: 3800 },
    { id: "VIP-022", species: "Viper", snakeId: "SN-028", temp: 29.5, humidity: 60, status: "stable", weightG: 720 },
    { id: "COR-012", species: "Corn Snake", snakeId: "SN-201", temp: 27.8, humidity: 52, status: "stable", weightG: 385 },
    { id: "RET-012", species: "Reticulated", snakeId: "SN-088", temp: 32.8, humidity: 65, status: "stable", weightG: 9200 },
    { id: "COB-031", species: "King Cobra", snakeId: "SN-063", temp: 30.2, humidity: 62, status: "stable", weightG: 4800 },
  ].map(applyCameraPair),

  /** Dashboard live camera strip — full grid of snake enclosure feeds */
  getLiveCameras() {
    return this.enclosures;
  },

  snakes: [
    {
      id: "SN-033",
      name: "Ball Python SN-033",
      species: "Ball Python",
      enclosure: "PY-101",
      health: "healthy",
      digest: 78,
      fed: "2d ago",
      prey: "Mouse 45g",
    },
    {
      id: "SN-091",
      name: "Boa #091",
      species: "Boa",
      enclosure: "BOA-015",
      health: "healthy",
      digest: 88,
      fed: "4d ago",
      prey: "Rat 280g",
    },
    {
      id: "SN-015",
      name: "Viper #015",
      species: "Viper",
      enclosure: "VIP-015",
      health: "at-risk",
      digest: 35,
      fed: "3d ago",
      prey: "Mouse 32g",
      stalled: true,
    },
    {
      id: "SN-041",
      name: "King Cobra SN-041",
      species: "King Cobra",
      enclosure: "COB-022",
      health: "at-risk",
      fed: "5d ago",
      prey: "Rat 450g",
    },
    { id: "SN-052", name: "Reticulated SN-052", species: "Reticulated", enclosure: "RET-008", health: "healthy", breeding: "Gravid", estDate: "12 Jun" },
    { id: "SN-077", name: "Ball Python SN-077", species: "Ball Python", enclosure: "PY-088", health: "healthy", breeding: "Pre-Ovulation", estDate: "28 May" },
    { id: "SN-114", name: "Corn Snake SN-114", species: "Corn Snake", enclosure: "COR-044", health: "critical", breeding: "Breeding Active", estDate: "—" },
    { id: "SN-102", name: "Boa SN-102", species: "Boa", enclosure: "BOA-028", health: "healthy" },
    { id: "SN-028", name: "Viper SN-028", species: "Viper", enclosure: "VIP-022", health: "healthy" },
    { id: "SN-201", name: "Corn Snake SN-201", species: "Corn Snake", enclosure: "COR-012", health: "healthy" },
    { id: "SN-088", name: "Reticulated SN-088", species: "Reticulated", enclosure: "RET-012", health: "healthy" },
    { id: "SN-063", name: "King Cobra SN-063", species: "King Cobra", enclosure: "COB-031", health: "healthy" },
  ].map(applyCameraPair),

  alerts: [
    { id: "A1", level: "critical", title: "Viper #015 — Digestion Stalled", detail: "Thermal pattern unchanged 18h", time: "12 min ago", enclosure: "VIP-015", snake: "SN-015", ack: false },
    { id: "A2", level: "warning", title: "Enclosure COB-022 — Low Humidity", detail: "58% below target 65%", time: "32 min ago", enclosure: "COB-022", ack: false },
    { id: "A3", level: "critical", title: "Corn Snake COR-044 — Habitat Critical", detail: "Temp + humidity out of range", time: "45 min ago", enclosure: "COR-044", snake: "SN-114", ack: false },
    { id: "A4", level: "warning", title: "Reticulated SN-052 — Pre-lay Window", detail: "Prepare nesting box", time: "1 hr ago", snake: "SN-052", ack: false },
    { id: "A5", level: "warning", title: "Ball Python SN-033 — RI Risk", detail: "Respiratory trend flagged", time: "2 hr ago", snake: "SN-033", ack: true },
    { id: "A6", level: "warning", title: "Block B — HVAC drift", detail: "Setpoint review needed", time: "3 hr ago", ack: false },
    { id: "A7", level: "critical", title: "VIP-015 — Feeding overdue", detail: "Scheduled feed missed", time: "4 hr ago", snake: "SN-015", ack: false },
  ],

  risks: [
    { key: "thermal", label: "Thermal Stress", count: 18, screen: "environment", theme: "red", icon: "risk-heat.svg" },
    { key: "resp", label: "Respiratory Risk", count: 12, screen: "health", theme: "orange", icon: "risk-respiratory.svg" },
    { key: "digest", label: "Digestive Risk", count: 9, screen: "digestion", theme: "yellow", icon: "horse-risk-digestive.svg" },
    { key: "chronic", label: "Chronic Issues", count: 6, screen: "health", theme: "purple", icon: "risk-chronic.svg" },
    { key: "shed", label: "Shedding Problems", count: 11, screen: "health", theme: "green", icon: "risk-shed.svg" },
  ],

  healthRecords: [
    {
      snakeId: "SN-114",
      enclosure: "COR-044",
      status: "critical",
      risk: "thermal",
      diagnosis: "Habitat critical — temperature and humidity out of safe range",
      symptoms: ["Cool-side 68°F (target 74–78°F)", "Humidity 45% (target 50–70%)", "Lethargy observed"],
      vitals: { weight: "412 g", weightDelta: "−8 g / 7d", respiration: "Elevated", shed: "Incomplete (partial)" },
      treatment: "Emergency HVAC adjustment Block C; increase misting 2× daily; isolate heat lamp audit",
      followUp: "Recheck in 6 hours · enclosure thermal log review",
      vet: "Dr. Sarah Mitchell",
      lastExam: "45 min ago",
      trend: "worsening",
    },
    {
      snakeId: "SN-015",
      enclosure: "VIP-015",
      status: "at-risk",
      risk: "digest",
      diagnosis: "Digestion stalled — no thermal rise post-feeding",
      symptoms: ["Fed 3d ago — no progression", "Thermal pattern flat 18h", "Prey: mouse 32g retained"],
      vitals: { weight: "890 g", weightDelta: "+12 g / 7d", respiration: "Normal", shed: "In cycle" },
      treatment: "Withhold handling; monitor thermal hourly; consider assist feed protocol if no change 24h",
      followUp: "Thermal sync every 2h · alert escalated",
      vet: "Dr. Sarah Mitchell",
      lastExam: "12 min ago",
      trend: "stable",
    },
    {
      snakeId: "SN-033",
      enclosure: "PY-101",
      status: "at-risk",
      risk: "resp",
      diagnosis: "Respiratory infection risk — acoustic & trend flags",
      symptoms: ["Occasional open-mouth posture", "Slight wheeze on auscultation", "Otherwise active"],
      vitals: { weight: "623 g", weightDelta: "+4 g / 7d", respiration: "Mild crackles", shed: "Complete last week" },
      treatment: "Nebulization protocol started; reduce stress; culture swab pending",
      followUp: "Vet rounds tomorrow 09:00",
      vet: "Dr. James Chen",
      lastExam: "2 hr ago",
      trend: "improving",
    },
    {
      snakeId: "SN-041",
      enclosure: "COB-022",
      status: "at-risk",
      risk: "thermal",
      diagnosis: "Low humidity stress — enclosure below target",
      symptoms: ["Humidity 58% sustained", "Shed quality reduced prior cycle"],
      vitals: { weight: "5.2 kg", weightDelta: "Stable", respiration: "Normal", shed: "Good" },
      treatment: "Humidifier output increased; substrate moisture check; daily RH log",
      followUp: "Review in 48h",
      vet: "Keeper Ravi",
      lastExam: "32 min ago",
      trend: "improving",
    },
    {
      snakeId: "SN-052",
      enclosure: "RET-008",
      status: "at-risk",
      risk: "chronic",
      diagnosis: "Pre-lay gravid female — elevated metabolic demand",
      symptoms: ["Gravid confirmed", "Increased basking time", "Reduced feeding response"],
      vitals: { weight: "14.8 kg", weightDelta: "+180 g / 14d", respiration: "Normal", shed: "Pre-lay" },
      treatment: "Nesting box prepared; calcium supplement; minimize disturbance",
      followUp: "Est. lay window 12 Jun — daily observation",
      vet: "Dr. Sarah Mitchell",
      lastExam: "1 hr ago",
      trend: "stable",
    },
  ],

  healthTimeline: [
    { time: "45 min ago", text: "COR-044 habitat alert escalated to critical", level: "critical" },
    { time: "32 min ago", text: "COB-022 humidity protocol applied", level: "warning" },
    { time: "12 min ago", text: "VIP-015 digestion stall flagged on thermal AI", level: "critical" },
    { time: "2 hr ago", text: "SN-033 RI risk assessment — nebulization started", level: "warning" },
    { time: "Today 08:30", text: "Block B environmental walkthrough completed", level: "info" },
    { time: "Yesterday", text: "Weekly weight audit — 78 snakes recorded", level: "info" },
  ],

  feedingWeek: [
    { day: "Mon", count: 12, note: "Various prey" },
    { day: "Tue", count: 18, note: "Rats / mice" },
    { day: "Wed", count: 15, note: "Various prey" },
    { day: "Thu", count: 31, note: "Peak day" },
    { day: "Fri", count: 22, note: "Various prey" },
    { day: "Sat", count: 8, note: "Small prey" },
    { day: "Sun", count: 5, note: "Maintenance" },
  ],

  activities: [
    { text: "Fed Ball Python SN-033 — Keeper Ravi", time: "10:42" },
    { text: "Environmental check Block B completed", time: "09:15" },
    { text: "Thermal sync batch uploaded", time: "08:30", countKey: "enclosures" },
    { text: "Gravid alert acknowledged SN-052", time: "Yesterday" },
    { text: "Weight calibration rack C-12", time: "Yesterday" },
  ],

  /** Full activity log for dashboard modal (timeline + keeper events) */
  getActivityLog() {
    const timeline = (this.healthTimeline || []).map((e) => ({
      text: e.text,
      time: e.time,
      level: e.level || "info",
    }));
    const keeper = (this.activities || []).map((a) => {
      let text = a.text;
      if (a.countKey === "enclosures") {
        const n = this.kpis?.enclosures ?? this.enclosures.length;
        text += ` (${n} enclosures)`;
      }
      return { text, time: a.time, level: "info" };
    });
    return [...timeline, ...keeper];
  },

  /** Facility-wide counts — single source for KPIs, health, and screen subtitles */
  getStats() {
    const k = this.kpis;
    const records = this.healthRecords;
    const speciesCount = new Set([
      ...this.enclosures.map((e) => e.species),
      ...this.snakes.map((s) => s.species),
    ]).size;
    const criticalCases = records.filter((r) => r.status === "critical").length;
    const atRiskCases = records.filter((r) => r.status === "at-risk").length;
    const notHealthy = k.snakes - k.healthy;
    const alertsUnacked = this.alerts.filter((a) => !a.ack).length;
    return {
      totalSnakes: k.snakes,
      totalEnclosures: k.enclosures,
      healthy: k.healthy,
      healthyPct: Math.round((k.healthy / k.snakes) * 1000) / 10,
      digesting: k.digesting,
      breeding: k.breeding,
      feedingToday: k.feedingToday,
      notHealthy,
      criticalCases,
      atRiskCases,
      monitoring: notHealthy - criticalCases,
      activeCases: records.length,
      checkupsToday: records.length + 1,
      checkupsCompleted: 2,
      alertsTotal: this.alerts.length,
      alertsUnacked,
      trackedEnclosures: this.enclosures.length,
      trackedSnakes: this.snakes.length,
      digestingTracked: this.snakes.filter((s) => s.digest != null).length,
      breedingTracked: this.snakes.filter((s) => s.breeding).length,
      feedingWeekTotal: this.feedingWeek.reduce((sum, d) => sum + d.count, 0),
      demoHealthy: this.snakes.filter((s) => s.health === "healthy").length,
      speciesCount,
      staffOnDuty: k.staffOnDuty ?? 6,
    };
  },

  getScreenSub(screenId) {
    const s = this.getStats();
    const k = this.kpis;
    const subs = {
      enclosures: `${s.trackedEnclosures} racks on screen · ${s.totalEnclosures} facility-wide`,
      animals: `${s.totalSnakes} snakes · ${s.trackedSnakes} full profiles in registry`,
      health: `${s.activeCases} open cases · ${s.healthy} healthy (${s.healthyPct}%)`,
      digestion: `${s.digesting} digesting · ${s.digestingTracked} tracked in detail`,
      breeding: `${s.breeding} pairs · ${s.breedingTracked} active profiles`,
      feeding: `${s.feedingToday} feeds today · ${s.feedingWeekTotal} prey events this week`,
      alerts: `${s.alertsTotal} in queue · ${s.alertsUnacked} need action`,
      environment: `${s.trackedEnclosures} zones monitored · ${s.totalEnclosures} enclosures`,
    };
    return subs[screenId] || this.screenMeta[screenId]?.sub || "";
  },

  screenMeta: {
    dashboard: { title: "DASHBOARD" },
    enclosures: { title: "ENCLOSURES", sub: "" },
    animals: { title: "SNAKES REGISTRY", sub: "" },
    health: { title: "HEALTH MONITORING", sub: "Clinical cases, vitals, protocols & risk analytics" },
    digestion: { title: "DIGESTION TRACKING", sub: "RGB + thermal timelines" },
    breeding: { title: "BREEDING & FERTILITY", sub: "Pairs, gravid & ovulation calendar" },
    feeding: { title: "FEEDING SCHEDULE", sub: "Weekly prey calendar" },
    environment: { title: "ENVIRONMENTAL CONTROL", sub: "HVAC, setpoints & building zones" },
    alerts: { title: "ALERTS", sub: "Active queue & acknowledgements" },
    reports: { title: "REPORTS", sub: "Export & compliance" },
    settings: { title: "SETTINGS", sub: "Thresholds & integrations" },
  },
};
