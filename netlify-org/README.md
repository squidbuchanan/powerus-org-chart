# Powerus Org Chart — shared & editable, on Netlify

This folder is a complete, deployable site. Once live, **anyone with the link
can edit** the org chart (List/Chart structure, Skills, Advisory Board & Board
of Directors) and their changes are saved to one shared source of truth — so the
next visitor, or a refresh, always shows the latest.

```
netlify-org/
├─ public/                 ← the site (served as-is)
│  ├─ index.html           ← the org chart
│  ├─ *.js, *.css          ← app code (incl. org-store.js, the sync layer)
├─ netlify/functions/
│  └─ org-state.mjs        ← the save/load API (Netlify Blobs — no database needed)
├─ netlify.toml            ← build config
└─ package.json            ← one dependency: @netlify/blobs
```

## How saving works
- Edits are written to the browser, then pushed to the `org-state` function,
  which stores them in **Netlify Blobs** (a built-in key/value store — no
  database to set up, free tier).
- On load, the page pulls the shared document first, so everyone sees the same
  data.
- A small **"All changes saved"** indicator appears in the header.
- If the site is opened off-Netlify (or offline), it falls back to local-only
  saving and keeps working.

## Deploy (recommended: Git + Netlify)
This is the easiest path because Netlify installs the dependency and bundles the
function automatically.

1. Put this `netlify-org` folder in a Git repo (its own repo, or a subfolder).
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build settings (Netlify reads `netlify.toml`, so usually auto-filled):
   - **Build command:** *(leave empty)*
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
4. Deploy. That's it — Blobs is enabled automatically on the deployed site.

If the folder is a subdirectory of a larger repo, set Netlify's **Base
directory** to `netlify-org` so the paths above resolve.

## Deploy (alternative: Netlify CLI)
```bash
cd netlify-org
npm install
npx netlify deploy --build --prod
```

## Local preview with the live backend
```bash
cd netlify-org
npm install
npx netlify dev
```
`netlify dev` runs the function locally so edits persist while you test.

> Note: a plain drag-and-drop deploy of the folder will serve the page but
> **won't** run the save function (it skips dependency install/bundling). Use
> one of the two methods above for shared saving.

## Resetting to defaults
Each editable section has a **Restore Defaults** button. That rebuilds the
section from the data shipped in the app code and saves the cleared state to the
shared document for everyone.
