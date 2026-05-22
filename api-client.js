/**
 * Browser client — mirrors DATASET_DOWNLOAD_APPLIC/src/api.py (ApiClient).
 * Use with config.api.js on GitHub Pages; requires CORS + HTTPS on EC2.
 */
(function (global) {
  class VetApiClient {
    constructor(config) {
      const c = config || global.API_CONFIG || {};
      this.baseUrl = String(c.baseUrl || "").replace(/\/$/, "");
      this.deviceId = String(c.deviceId || "").trim();
      this.timeoutMs = Number(c.timeoutMs) || 25000;
      if (!this.baseUrl) throw new Error("API baseUrl is required (config.api.js).");
    }

    _url(endpoint) {
      if (/^https?:\/\//i.test(endpoint)) return endpoint;
      return `${this.baseUrl}/${String(endpoint).replace(/^\//, "")}`;
    }

    async _request(method, endpoint, { params, json } = {}) {
      const url = new URL(this._url(endpoint));
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v != null && v !== "") url.searchParams.set(k, String(v));
        });
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const headers = {
        "X-Device-Id": this.deviceId,
        "ngrok-skip-browser-warning": "1",
      };
      const init = { method, headers, signal: controller.signal };
      if (json != null) {
        headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(json);
      }
      try {
        const res = await fetch(url.toString(), init);
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${endpoint}${text ? `: ${text.slice(0, 200)}` : ""}`);
        }
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) return res.json();
        return res.text();
      } finally {
        clearTimeout(timer);
      }
    }

    setDeviceId(deviceId) {
      const clean = String(deviceId || "").trim();
      if (!clean) throw new Error("Device ID cannot be empty.");
      this.deviceId = clean;
    }

    login(deviceId, password) {
      this.setDeviceId(deviceId);
      return this._request("POST", "/api/login", {
        json: { device_id: this.deviceId, password },
      });
    }

    health() {
      return this._request("GET", "/api/health");
    }

    listPets() {
      return this._request("GET", "/api/pets/");
    }

    examSessions(petId) {
      return this._request("GET", `/api/pets/${encodeURIComponent(petId)}/exam-sessions`);
    }

    recordings(petId, examSessionId) {
      return this._request("GET", `/api/pets/${encodeURIComponent(petId)}/recordings`, {
        params: { exam_session_id: examSessionId },
      });
    }

    petTemperature(petId) {
      return this._request("GET", `/api/pets/${encodeURIComponent(petId)}/temperature`);
    }

    petTemperatureBySession(petId, examSessionId) {
      return this._request("GET", `/api/pets/${encodeURIComponent(petId)}/temperature`, {
        params: { exam_session_id: examSessionId },
      });
    }

    dailyPets(date) {
      return this._request("GET", "/api/device/daily-pets", {
        params: date ? { date } : undefined,
      });
    }

    temperatureNotes(petId, examSessionId) {
      return this._request("GET", `/api/pets/${encodeURIComponent(petId)}/temperature/notes`, {
        params: examSessionId ? { exam_session_id: examSessionId } : undefined,
      });
    }
  }

  /** Normalize list responses like ui.py does */
  function normalizePets(response) {
    if (Array.isArray(response)) return response;
    return response?.pets || [];
  }

  function normalizeSessions(response) {
    if (Array.isArray(response)) return response;
    return response?.exam_sessions || [];
  }

  global.VetApiClient = VetApiClient;
  global.VetApiNormalize = { normalizePets, normalizeSessions };
})(window);
