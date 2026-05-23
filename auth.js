/**
 * ARMY device login gate — horse-only dashboard after sign-in.
 */
(function (global) {
  const SESSION_KEY = "vet_auth_session";
  const ALLOWED_DEVICE = "ARMY";

  function $(id) {
    return document.getElementById(id);
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (s.deviceId !== ALLOWED_DEVICE || !s.password) return null;
      return s;
    } catch {
      return null;
    }
  }

  function saveSession(deviceId, password) {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ deviceId, password, loggedInAt: Date.now() })
    );
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("vet_device_password");
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function showLogin(errMsg) {
    $("login-screen")?.removeAttribute("hidden");
    $("app-root")?.setAttribute("hidden", "");
    document.body.classList.remove("device-army", "species-horse-only");
    const err = $("login-error");
    if (errMsg) {
      err.textContent = errMsg;
      err.hidden = false;
    } else if (err) {
      err.hidden = true;
      err.textContent = "";
    }
  }

  function showApp() {
    $("login-screen")?.setAttribute("hidden", "");
    $("app-root")?.removeAttribute("hidden");
    $("logout-btn")?.removeAttribute("hidden");
  }

  function applyHorseOnlyMode() {
    document.body.classList.add("device-army", "species-horse-only");
    document.title = "VetInstant — Horse Health (ARMY)";

    const sel = $("species-select");
    if (sel) {
      sel.hidden = true;
      sel.setAttribute("aria-hidden", "true");
      sel.value = "horse";
    }
    const locked = $("species-locked-label");
    if (locked) locked.hidden = false;

    if (global.API_CONFIG) {
      global.API_CONFIG.deviceId = ALLOWED_DEVICE;
    }

    if (typeof global.applySpeciesConfig === "function") {
      global.applySpeciesConfig("horse");
    }
  }

  function onDashboardReady() {
    applyHorseOnlyMode();
    if (global.VetLiveApi?.loadAllPets) {
      global.VetLiveApi.loadAllPets();
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const deviceId = ($("login-device")?.value || ALLOWED_DEVICE).trim().toUpperCase();
    const password = ($("login-password")?.value || "").trim();
    const submit = $("login-submit");
    const err = $("login-error");

    if (deviceId !== ALLOWED_DEVICE) {
      if (err) {
        err.textContent = "Only ARMY device login is allowed.";
        err.hidden = false;
      }
      return;
    }
    if (!password) {
      if (err) {
        err.textContent = "Enter the ARMY device password.";
        err.hidden = false;
      }
      return;
    }

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Signing in…";
    }
    if (err) err.hidden = true;

    try {
      if (!global.API_CONFIG?.baseUrl) throw new Error("API not configured (config.api.js).");
      const client = new global.VetApiClient({ ...global.API_CONFIG, deviceId });
      await client.login(deviceId, password);

      saveSession(deviceId, password);
      sessionStorage.setItem("vet_device_password", password);
      global.__vetApiClient = client;

      showApp();
      applyHorseOnlyMode();

      if (typeof global.applySpeciesConfig === "function") {
        onDashboardReady();
      } else {
        window.addEventListener(
          "dashboard:ready",
          () => onDashboardReady(),
          { once: true }
        );
      }
    } catch (e) {
      if (err) {
        err.textContent = e.message || "Login failed. Check password, ngrok, and CORS.";
        err.hidden = false;
      }
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = "Sign in to dashboard";
      }
    }
  }

  function handleLogout() {
    clearSession();
    location.reload();
  }

  function init() {
    $("login-form")?.addEventListener("submit", handleLogin);
    $("logout-btn")?.addEventListener("click", handleLogout);

    window.addEventListener("dashboard:ready", () => {
      if (isLoggedIn()) onDashboardReady();
    });

    if (isLoggedIn()) {
      showApp();
    } else {
      showLogin();
    }
  }

  document.addEventListener("DOMContentLoaded", init);

  global.VetAuth = {
    isLoggedIn,
    getSession,
    getDeviceId: () => ALLOWED_DEVICE,
    onDashboardReady,
    applyHorseOnlyMode,
    logout: handleLogout,
  };
})(window);
