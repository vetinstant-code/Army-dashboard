# GitHub Pages dashboard + EC2 API

Host the **static dashboard** on GitHub Pages. Keep the **API on EC2** (same backend `DATASET_DOWNLOAD_APPLIC` uses). The browser calls EC2 over HTTPS.

---

## No domain? No cert on EC2? (read this first)

You do **not** need to buy a domain. GitHub Pages is always **HTTPS**, so the browser **blocks** `fetch("http://43.x.x.x:8000/...")` from your Pages site (mixed content). Your API can stay HTTP on EC2 internally; you only need **one public HTTPS URL** in front of it.

### Free HTTPS in front of EC2 (no domain purchase)

Pick one — both give you a `https://....` URL you put in `config.api.js`:

| Tool | What you get | EC2 setup |
|------|----------------|-----------|
| **Cloudflare Tunnel** (`cloudflared`) | `https://random-name.trycloudflare.com` | Install `cloudflared` on EC2, tunnel to `localhost:8000` |
| **ngrok** (free tier) | `https://xxxx.ngrok-free.app` | `ngrok http 8000` on EC2 |

**Cloudflare Tunnel (quick):**

```bash
# On EC2 (Linux)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
./cloudflared tunnel --url http://127.0.0.1:8000
```

Copy the printed `https://....trycloudflare.com` URL → use as `baseUrl` in `config.api.js`.  
Enable CORS on your API for `https://YOUR_USER.github.io` (and `http://localhost:5173` for local tests).

Tunnel URL changes when you restart unless you use a named tunnel (optional, still no purchased domain).

### Skip GitHub for live API — host dashboard on EC2 (HTTP only)

If you only need it for yourself / clinic LAN:

- Serve the dashboard files from **nginx on the same EC2** as the API.
- Open **`http://EC2_PUBLIC_IP/`** (one origin, no mixed content).
- GitHub Pages not required for live data; you can still keep the repo on GitHub as backup.

### GitHub Pages + no HTTPS tunnel — static snapshots only

Run a small Python script on EC2 (uses existing `ApiClient`) on a schedule → writes `live-data.json` → commit or SCP to the repo → dashboard reads JSON. No CORS, no tunnel; data is not real-time.

---

## Architecture

```
Browser (https://<user>.github.io/<repo>/)
    → fetch() + X-Device-Id
    → EC2 (HTTPS, e.g. https://api.yourdomain.com)
        → your app on :8000 (FastAPI/uvicorn)
```

GitHub Pages **cannot** run Python or proxy API requests. Only EC2 (or another server) runs the API.

---

## 1. EC2 — API must be HTTPS + CORS

GitHub Pages is **HTTPS**. Browsers block calling `http://43.205.x.x:8000` from an HTTPS page.

### Option A — Nginx on EC2 (recommended)

1. Point a domain (or subdomain) to the EC2 public IP, e.g. `api.yourdomain.com`.
2. Install certbot and get a TLS certificate.
3. Proxy to your app (port 8000):

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    # ssl_certificate paths from certbot ...

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS for GitHub Pages (replace with your real Pages URL)
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "https://YOUR_USER.github.io";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, X-Device-Id, Authorization";
            add_header Access-Control-Max-Age 86400;
            return 204;
        }
        add_header Access-Control-Allow-Origin "https://YOUR_USER.github.io" always;
        add_header Access-Control-Allow-Headers "Content-Type, X-Device-Id, Authorization" always;
    }
}
```

Reload nginx after editing.

### Option B — CORS in FastAPI (if you control the backend code)

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://YOUR_USER.github.io",
        "http://localhost:5173",  # local testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # must include X-Device-Id
)
```

Still use **HTTPS** in front (nginx or ALB); CORS alone is not enough for mixed content.

### Security group

- Open **443** (HTTPS) to the internet (or your office IP).
- Do **not** expose port 8000 publicly if nginx terminates TLS on 443.

---

## 2. GitHub — host the dashboard

1. Create a repo (e.g. `vetinstant-dashboard`).
2. Copy the **contents** of this folder (`dashboard/dashboard/dashboard/`) to the repo root, or use a `/docs` folder.
3. Add `.nojekyll` (already present in snake subfolder; add at site root if needed).
4. **Settings → Pages →** branch `main`, folder `/` (root) or `/docs`.
5. Live URL: `https://YOUR_USER.github.io/REPO_NAME/`

For the **snake** demo only, use the `snake/` folder as site root (see `snake/DEPLOY.md`).

For **cattle / VetInstant** UI with live pets API, use this folder and wire `api-client.js` (below).

---

## 3. Dashboard — connect to EC2 API

1. Copy `config.api.example.js` → `config.api.js` (do **not** commit real passwords).
2. Set `API_BASE_URL` to your HTTPS API, e.g. `https://api.yourdomain.com`.
3. Set `DEVICE_ID` to match `config.py` (`Bruno`, `Zara`, etc.).
4. Include scripts in `index.html` **before** your main app logic:

```html
<script src="config.api.js"></script>
<script src="api-client.js"></script>
```

5. On load, call the API and map results into the UI (example):

```javascript
async function loadLiveHerd() {
  const client = new VetApiClient(window.API_CONFIG);
  await client.login(window.API_CONFIG.deviceId, window.API_CONFIG.password);
  const raw = await client.listPets();
  const pets = Array.isArray(raw) ? raw : raw.pets || [];
  // Map pet.id, pet.name → cattleData / table rows (see api-adapter.js)
}
```

`api-client.js` mirrors `DATASET_DOWNLOAD_APPLIC/src/api.py` endpoints.

---

## 4. Login / secrets (important)

The Python app sends **device_id + password** to `POST /api/login`. Putting the password in `config.api.js` on a **public GitHub repo** exposes it to everyone.

Safer options:

| Approach | Notes |
|----------|--------|
| **Read-only public endpoints** | Backend exposes dashboard-safe routes without password; device id only. |
| **Proxy on EC2** | e.g. `POST /dashboard-auth` checks password server-side; browser gets a short-lived token. |
| **Private repo + GitHub Pages** | Still visible in browser DevTools — not true security. |
| **VPN / IP allowlist** | API only reachable from your network; Pages for internal demo only. |

For a first internal demo, use a dedicated device password and rotate it; plan a proxy before going public.

---

## 5. Map API → dashboard UI

| API (`api.py`) | Dashboard use |
|----------------|-----------------|
| `GET /api/pets/` | Herd list, KPI “Total Animals” |
| `GET /api/pets/{id}/exam-sessions` | Health records / sessions |
| `GET /api/pets/{id}/temperature?exam_session_id=` | Vitals, charts |
| `GET /api/device/daily-pets` | Dashboard “today” queue |
| `GET /api/health` | Settings / connection status |

The cattle `index.html` today uses inline **mock** `cattleData`. Replace or merge that object after `listPets()` + temperature calls. Snake `data.js` is a separate mock zoo demo.

---

## 6. Local test before GitHub

```powershell
cd dashboard\dashboard\dashboard
npx --yes serve -l 5173
```

Open `http://localhost:5173`. Add `http://localhost:5173` to API CORS. Use `config.api.js` pointing at your EC2 HTTPS URL.

Check DevTools → **Network** for failed requests (CORS, 401, mixed content).

---

## 7. Checklist

- [ ] API reachable at `https://api.yourdomain.com/api/health`
- [ ] CORS allows your GitHub Pages origin
- [ ] `config.api.js` uses HTTPS base URL (not `http://IP:8000`)
- [ ] `X-Device-Id` header sent on every request (handled by `api-client.js`)
- [ ] Dashboard repo published on GitHub Pages
- [ ] Mock data replaced or blended with live `listPets()` mapping
