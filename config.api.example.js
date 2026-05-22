/**
 * Copy to config.api.js and fill in your EC2 HTTPS API URL.
 * Do NOT commit config.api.js if it contains a real password.
 */
window.API_CONFIG = {
  /** Public HTTPS URL (nginx → uvicorn on EC2), not raw :8000 HTTP IP */
  baseUrl: "https://api.yourdomain.com",
  deviceId: "Bruno",
  password: "YOUR_DEVICE_PASSWORD",
  timeoutMs: 25000,
};
