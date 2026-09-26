# Hosting — album.glomium.co

Everything to upload lives in `album-dist/`. It is a plain static folder: no build
step, no Node, no server. The database, auth, storage and video uploads are all
Supabase, so the host only ever serves files.

## What's in the folder

| File | Purpose |
|---|---|
| `index.html` | Front door. `/?event=slug` → album, `/?project=slug` → project page, otherwise the workspace. |
| `admin.html` | The staff workspace. Sign-in page. |
| `album.html` | The wedding album a client receives. |
| `commercial.html` | The project page a commercial/festival/digital/press client receives. |
| `feedback.html` | The confidential freelancer feedback form. Opens only with a token: `/f/<token>`. |
| `portfolio.html` | Private portfolio for clients. Unlisted, `noindex`. Share `/work`. |
| `image-slot.js` | Media slots used by the portfolio. |
| `support.js` | Runtime the three pages need. Must sit next to them. |
| `assets/` | Wordmark. |
| `_headers`, `_redirects` | Cloudflare Pages / Netlify config. |
| `netlify.toml`, `vercel.json` | Same rules for those two hosts. Harmless if unused. |

## Deploy — Cloudflare Pages (recommended)

Free, fast in India, and unlimited bandwidth — which matters because the albums
serve full-resolution photos and 600 MB films.

**Drag-and-drop (no repo):**
1. Cloudflare dashboard → Workers & Pages → Create → Pages → **Upload assets**.
2. Project name `glomium-album`. Drag the whole `album-dist` folder in. Deploy.
3. Custom domains → Set up a domain → `album.glomium.co`. Cloudflare adds the CNAME
   itself if the domain's DNS is already there.

**From Git (auto-deploys on every push):**
1. Push `album-dist/` to a repo — e.g. `glomiumofficial/album` .
2. Pages → Connect to Git → pick the repo.
3. Build command: leave **empty**. Build output directory: `/` (or `album-dist` if you
   pushed it as a subfolder). Framework preset: **None**.

## Deploy — Netlify

```
npm i -g netlify-cli
cd album-dist
netlify deploy --prod --dir .
```

Then Domain management → Add custom domain → `album.glomium.co`.

## Deploy — Vercel

```
npm i -g vercel
cd album-dist
vercel --prod
```

## DNS

One record, at whoever holds `glomium.co`:

```
CNAME   album   <the host's target, e.g. glomium-album.pages.dev>
```

Cloudflare Pages and Netlify both issue the HTTPS certificate automatically —
allow a few minutes after the DNS record resolves.

## Supabase — two settings to change after going live

1. **Authentication → URL Configuration → Site URL**: `https://album.glomium.co`
   Add `https://album.glomium.co/**` to Redirect URLs. Without this, password
   reset and magic links point at the wrong host.
2. **Project Settings → API → CORS**: add `https://album.glomium.co`.

The publishable key in `admin.html` is safe to ship — it is the anon key, and every
table is behind row-level security keyed to `staff_roles`. Never put the
*service_role* key in these files.

## Pretty links for clients

The redirect rules give you short links, which read better in a WhatsApp message
than a query string:

```
https://album.glomium.co/a/dilu-and-shana
https://album.glomium.co/p/<project-slug>
https://album.glomium.co/f/<token>
```

The long form (`album.html?event=dilu-and-shana`) keeps working. The link is the
secret — anyone holding it can view that album, which is deliberate.

Feedback links are generated inside the panel, from whatever origin it is served on.
Copy them only once the real domain is live — a link copied out of a preview will not
work for the freelancer. Opened without a token, `feedback.html` deliberately shows
"this link is not valid".

## Re-deploying after an edit

The folder is a copy, not a live link. When `album-system/*.html` changes, re-copy
the changed files into `album-dist/` and redeploy (or push, if you wired up Git).
