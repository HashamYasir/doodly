# Free deploy checklist (beginner friendly)

## Before you publish (5 minutes)

- [ ] Open `data/site.js` and change **`contact`** to your real email (`"mailto:you@yourmail.com"`). Optionally add your name as `author`.
- [ ] Open `data/games.js`. Is your game listed with the right title, description and cover?
- [ ] (Optional) Run `node scripts/check.mjs`. You want to see `✓ Catalogue OK`.
- [ ] Open `index.html` (or run `python3 -m http.server 8000` → <http://localhost:8000>) and click through: Home → Play → game page → Back.
- [ ] Set the real `released` date for "How Much Is Too Much?" in `data/games.js` (it counts as New for 90 days).
- [ ] Note: the game loads Three.js from the internet (cdnjs), so it needs a connection to play.

## Option A: Netlify (easiest, no account tricks)

1. [ ] Make a free account at **netlify.com**.
2. [ ] Click **Add new site → Deploy manually**.
3. [ ] **Drag your whole project folder** (the one containing `index.html`) onto the page.
4. [ ] Wait a few seconds. You get a link like `https://something-random.netlify.app`.
5. [ ] Open it, then test a direct game link and a wrong link (you should see the DOODLY 404 page).
6. [ ] (Optional) *Site configuration → Change site name* to pick a nicer address.
7. [ ] To update later: *Deploys → drag the folder in again*.

## Option B: GitHub Pages

1. [ ] Make a free account at **github.com** and create a **new public repository** (e.g. `doodly`).
2. [ ] Upload all project files (including the hidden `.nojekyll`). Easiest: *Add file → Upload files*, drag the contents of the folder in, then **Commit**.
3. [ ] Go to **Settings → Pages**.
4. [ ] Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
5. [ ] Wait 1 to 2 minutes. Your site is at `https://<your-username>.github.io/<repo-name>/`.
6. [ ] Open it and test a direct game link, a refresh, and a wrong link (DOODLY 404 page).
7. [ ] To update later: upload the changed files again and commit.

## After publishing

- [ ] Open the live link **on your phone**. Play the game, rotate the screen, try Fullscreen.
- [ ] Share a direct game link: `https://your-site/game.html?g=spoon-scale` (add `#play` to start the game immediately).
- [ ] (Optional) Buy a domain and connect it: Netlify (*Domain management*) or GitHub (*Pages → Custom domain*). Both include free HTTPS.

## Adding a game later (the short version)

1. Copy `games/_template` → `games/<your-game>/` and build your game.
2. Add a cover to `assets/img/covers/`.
3. Add an entry in `data/games.js`.
4. Test locally → upload again.
