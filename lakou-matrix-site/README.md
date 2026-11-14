# Lakou Matrix: hosted version

One page (`index.html`) plus one server function (`netlify/functions/lakou.mjs`). It reads and writes your Notion catalog in the **Thesis - B.arch** hub (City Tech workspace). Same setup as Program Bubbles.

Opened without the server (inside Claude, or as a plain file), the page runs as a **demo** and keeps edits in that browser only.

## What's in Notion

| Table | What it holds | Who changes it |
|---|---|---|
| **Connectors** | Every overlap: title, culture, lens, strength (shell), evidence, overlap text, design cue, **status**, **photos**, **sound**, media credit, submitter fields | Site (editor/owner), Notion |
| **Lakou Cultures** | Outer orbit: name, key, color, order, show/hide, aliases, population and source, bearing, walk minutes, anchor | Owner on the site (name, color, order, show). **Population, bearing and walk minutes come from QGIS and are locked on the site.** |
| **Lakou Lenses** | Inner ring: name, key, pillar, order, show/hide, aliases | Owner |
| **Lakou Matrix Iterations** | Saved views (display settings); the one marked `is_default` is what visitors see | Editor saves; owner sets the default |

Rules that keep the data clean:
- **Only `Approved` connectors appear for visitors.** An empty status also counts as Approved. Visitor submissions arrive as `Submitted`. `Hidden` keeps a row without showing it.
- **Never change a `key`.** It's the permanent ID. Renaming a culture or lens on the site keeps the old name as an alias, so older rows still match.
- Connectors link to the catalog through `culture_ref` and `lens_ref`. Older rows that only have the `culture` and `dimension` selects still match by name or alias. As owner, use **Catalog → Link older rows to the catalog** once to fill in their links.
- Photos and sound go in the row's `photos` (up to 6) and `sound` (1 clip) columns in Notion. Name photo files the way you want them captioned.

## Roles on the site

| Role | How | Can do |
|---|---|---|
| Visitor | Nothing needed | Explore, cursor gravity, open orbits, play sound, **submit** to the review queue |
| Editor (Jennifer) | `EDITOR_KEY` password | Review queue (approve, edit, hide); edit any connector; **Edit on the graphic** (drag a point along its spoke to change its shell, or onto another spoke to change its lens); add connectors; save iterations |
| Owner (Nick) | `OWNER_KEY` password | Everything, plus cultures and lenses (name, color, order, show, pillar), drag cultures to reorder, set the default view, link older rows |

The server checks every write, not just the page: allowed cultures and lenses only, strength 1–3, required fields, text length limits, and a spam trap plus an hourly limit on submissions.

## Setup (about 20 minutes)

1. **Notion integration.** Use the same one as Program Bubbles, or create a new one at notion.so/my-integrations with Read, Update and Insert content. Copy its secret.
2. **Connect it to the hub.** In Notion, open **Thesis - B.arch** → ••• → **Connections** → add the integration. This covers all four tables.
3. **GitHub.** Create a repository (for example `lakou-matrix`) and upload `index.html`, `netlify.toml`, and the `netlify/functions/lakou.mjs` file at that same path.
4. **Netlify.** Choose Add new site → Import from GitHub → pick the repo. Leave the build settings empty, since `netlify.toml` covers them. Netlify Drop won't run the function, so use GitHub.
5. **Environment variables** (Site configuration → Environment variables):
   - `NOTION_TOKEN`: the integration secret
   - `EDITOR_KEY`: a password for Jennifer
   - `OWNER_KEY`: your password
   Then go to Deploys → **Trigger deploy**.
6. **Check it.** Open the site. The badge should say **Live**. Sign in under "Sign in, export, import". As owner, press **Link older rows to the catalog** once.
7. **Turn off visitor password protection** if Netlify added one, so embeds can load.

## Embedding

- **Notion:** type `/embed` on any page and paste the site URL.
- **Framer:** add an Embed component with the site URL. Each Framer page can show the same live tool.
- **Poster:** use **Copy SVG for Illustrator** for a still figure, and a QR code to the site URL for the live one.

## When QGIS data is ready

Import a CSV into **Lakou Cultures** with `key`, `population`, `population_source`, `bearing_deg` (0 = north, clockwise, from Newkirk Plaza) and `walk_min`. Then set **Place cultures by → Real direction** and **Distance from core → Walking minutes**, and save that as an iteration.

## Updating the site later

Replace `index.html` (and `lakou.mjs`, if it changed) in GitHub. Netlify redeploys automatically. Notion data never needs a redeploy; edits show within about a minute because the server caches for 60 seconds.
