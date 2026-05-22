# Let Cursor push your dashboard to GitHub

The agent **cannot** log into github.com in a browser as you. It can only run `git` on **your PC** if **your PC** is already allowed to push.

Do these steps once, then tell the agent your repo URL (e.g. `https://github.com/YOUR_USER/my-dashboard.git`).

---

## Step 1 — Create an empty repo on GitHub

1. Go to https://github.com/new  
2. Name it (e.g. `vetinstant-dashboard`)  
3. **Public** (required for free GitHub Pages)  
4. Do **not** add README, .gitignore, or license (keep it empty)  
5. Create repository  
6. Copy the URL: `https://github.com/YOUR_USER/vetinstant-dashboard.git`

---

## Step 2 — Pick ONE login method (recommended: GitHub CLI)

### Option A — GitHub CLI (easiest for the agent)

1. Install: https://cli.github.com/ (you installed on **D:** — that is fine).  
2. Find `gh.exe` (File Explorer → search **gh.exe** on `D:`). Example paths:
   - `D:\Software PC\GitHub CLI\gh.exe`
   - `D:\Programs\GitHub CLI\gh.exe`
3. **Add to PATH** (so Cursor and PowerShell find `gh`):
   - Windows key → “environment variables” → **Edit the system environment variables**
   - **Environment Variables** → under **User** → **Path** → **Edit** → **New**
   - Paste the **folder** that contains `gh.exe` (not the `.exe` itself)
   - OK → **close and reopen Cursor** (and PowerShell)
4. Or run with full path (no PATH needed):

```powershell
& "D:\Software PC\GitHub CLI\gh.exe" auth login
```

5. After login, push everything with the helper script (edit `$GhExe` inside if needed):

```powershell
cd "d:\OFFFICE\PROJECTS\Data_Collection_ethical\PYTHON_APPLIC\dashboard\dashboard\dashboard"
.\push-to-github.ps1
```

Classic login:

```powershell
gh auth login
```

Choose: **GitHub.com** → **HTTPS** → **Login with a web browser** → complete in browser.

3. Verify:

```powershell
gh auth status
```

Should say: `Logged in to github.com`.

4. Tell the agent: *“GitHub CLI is logged in, repo is https://github.com/USER/REPO.git”*

---

### Option B — SSH key

```powershell
ssh-keygen -t ed25519 -C "your-email@example.com" -f "$env:USERPROFILE\.ssh\id_ed25519" -N '""'
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
```

Copy the output → GitHub → **Settings** → **SSH and GPG keys** → **New SSH key** → paste.

Test:

```powershell
ssh -T git@github.com
```

Use remote: `git@github.com:YOUR_USER/REPO.git`

---

### Option C — Personal Access Token (HTTPS)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**  
2. Generate token with scope **`repo`**  
3. When the agent runs `git push`, use **username** = your GitHub username, **password** = the token (not your GitHub password)

---

## Step 3 — Allow Cursor to use git/network

When the agent runs `git push`, Cursor may ask you to approve:

- **Terminal / network** access  
- Sometimes **git_write** or **all** permissions  

Click **Allow** (or run the push yourself in the terminal the agent prints).

---

## Step 4 — Tell the agent exactly this

Copy-paste and fill in:

```
GitHub is ready to push.
Repo URL: https://github.com/YOUR_USER/YOUR_REPO.git
Branch: main
Ngrok API URL: https://wick-vehicular-dingy.ngrok-free.dev
Device ID: Bruno
(Password: I will enter in config.api.js myself — do not commit password)
Enable GitHub Pages from branch main, folder / (root).
```

---

## Step 5 — Turn on GitHub Pages (you or agent via gh)

After the first push:

**Website:** Repo → **Settings** → **Pages** → Source: **Deploy from a branch** → Branch **main** → folder **/** (root) → Save.

Live URL: `https://YOUR_USER.github.io/YOUR_REPO/`

---

## What the agent will run (after you enable auth)

```powershell
cd "d:\OFFFICE\PROJECTS\Data_Collection_ethical\PYTHON_APPLIC\dashboard\dashboard\dashboard"
git init
git add .
git commit -m "Add VetInstant dashboard with ngrok API config"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

---

## If push fails

| Error | Fix |
|--------|-----|
| `Authentication failed` | Run `gh auth login` or fix PAT/SSH |
| `Repository not found` | Wrong URL or no access to repo |
| `rejected` / `non-fast-forward` | Repo not empty — delete remote README or pull first |
| Cursor blocks push | Approve permissions or run `git push` yourself |

---

## Security

- Do **not** put device password in a **public** repo.  
- Use `config.api.js` locally only, or a login prompt in the dashboard.  
- ngrok URL changes when you restart ngrok — update `config.api.js` and push again.
