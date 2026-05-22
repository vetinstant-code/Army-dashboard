# Snake Zoo Dashboard — PWA & GitHub Pages

## PWA (installed app)

The app is a **Progressive Web App**:

| File | Purpose |
|------|---------|
| `manifest.webmanifest` | App name, icons, theme, standalone display |
| `service-worker.js` | Offline cache for shell + assets after first visit |
| `assets/icons/pwa-192.svg` | Install icon (192) |
| `assets/icons/pwa-512.svg` | Install icon (512) |

**Test locally:** serve over HTTP (required for service workers), not `file://`:

```powershell
cd d:\vetinstant\Cattle\dashboard\snake
npx --yes serve -l 5173
```

Open `http://localhost:5173` → DevTools → Application → Manifest / Service Workers.  
On mobile Chrome: menu → **Install app** or **Add to Home screen**.

---

## Publish on GitHub Pages

### Option A — Snake app only (recommended)

Use the **`snake/`** folder as the site root.

1. Create a GitHub repo (e.g. `vetinstant-snake-dashboard`).
2. Upload **only** the files below (not `node_modules/`).
3. Repo → **Settings** → **Pages** → Source: **Deploy from a branch**.
4. Branch: `main`, folder: **`/ (root)`** if you copied contents of `snake/` into the repo root,  
   **or** folder: **`/snake`** if the repo is the whole `Cattle/dashboard` project.

**If the repo root is the `snake` folder:**

- Live URL: `https://<username>.github.io/<repo-name>/`

**If the repo is `Cattle/dashboard` and Pages uses `/snake`:**

- Live URL: `https://<username>.github.io/<repo-name>/snake/`

---

### Option B — Whole dashboard repo

Keep cattle + snake in one repo. Enable Pages on branch `main`, folder `/` or `/docs`.  
Link to snake: `https://<user>.github.io/<repo>/snake/index.html`

---

## Files to upload to GitHub

### Required (app)

```
index.html
styles.css
enclosure-detail.css
enclosure-detail.js
app.js
data.js
manifest.webmanifest
service-worker.js
.nojekyll
```

### Required (assets)

```
assets/images/          (all PNG/JPG used by the app)
assets/icons/           (all SVG/PNG icons)
assets/thermal/         (thermal images)
```

### Optional (not needed for the live site)

```
scripts/                (Word doc generator only)
docs/                   (generated .docx)
package.json            (only if you run npm scripts locally)
```

### Do NOT upload

```
node_modules/
package-lock.json       (listed in .gitignore)
```

---

## GitHub web upload failed?

The **“file too large”** error on github.com usually means:

- **`node_modules/`** was included (~25+ MB), or
- **Reference mockups** and duplicate PNGs were uploaded (~85 MB of assets).

This repo is trimmed for Pages: **no `node_modules`**, mockups removed, enclosure images compressed (~3–5 MB total assets).

**Prefer `git push`** over dragging folders into the browser. Web upload is fine only for small folders.

To re-compress images locally (optional):

```powershell
cd snake
npm install sharp --no-save
node scripts/compress-assets.js
Remove-Item -Recurse -Force node_modules
```

---

## Quick upload checklist

1. Copy the `snake` folder to your machine or clone the repo.
2. Confirm **`snake/node_modules` is absent** (never commit it).
3. Push to GitHub:

```powershell
cd path\to\your-repo
git init
git add snake/
git commit -m "Add Snake Zoo PWA dashboard"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

4. Turn on **GitHub Pages** (Settings → Pages).
5. Wait 1–2 minutes, open the Pages URL.

---

## Regenerate Word proposal (local only)

```powershell
cd snake
npm install
npm run proposal:docx
```

Output: `docs/Smart_Snake_Enclosure_Technical_Proposal.docx` — do not commit unless you want it in the repo.
