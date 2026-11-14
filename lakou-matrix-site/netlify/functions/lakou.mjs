// Lakou Matrix API — reads and writes the Notion catalog.
// Env vars (Netlify → Site configuration → Environment variables):
//   NOTION_TOKEN  the Notion integration secret (required)
//   EDITOR_KEY    password for editors (Jennifer): approve, edit content, drag points, save iterations
//   OWNER_KEY     password for the owner (Nick): everything, incl. cultures, lenses, default view
// The Notion integration must be connected to the "Thesis - B.arch" page (••• → Connections).

const NOTION = "https://api.notion.com/v1";
const VERSION = "2022-06-28";
const DB = {
  connectors: "1e3396550d0e4553a27deca91d580123",
  cultures: "417d488064bd81f0b2c6c976e09c0e2a",
  lenses: "417d488064bd81f1ae32c9e0bc02950d",
  iterations: "417d488064bd81c6bbc1c7e29100374d",
};
const PILLARS = ["activity", "connectivity", "ecology", "community"];
const EVIDENCE = ["documented", "hypothesis", "confirm source"];
const STATUS = ["Approved", "Submitted", "Hidden"];
const CACHE_MS = 60_000;

let cache = null, cacheAt = 0;
const hits = new Map(); // ip -> [timestamps] for submit rate limiting

// ---------- Notion helpers ----------
async function notion(path, method = "GET", body) {
  const r = await fetch(NOTION + path, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Notion ${r.status}: ${j.message || "request failed"}`);
  return j;
}
async function queryAll(db) {
  let out = [], cursor;
  do {
    const j = await notion(`/databases/${db}/query`, "POST", { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) });
    out = out.concat(j.results);
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  return out.filter((p) => !p.archived && !p.in_trash);
}
const P = (page, name) => page.properties?.[name];
const text = (p) => (p?.title || p?.rich_text || []).map((t) => t.plain_text).join("");
const num = (p) => (typeof p?.number === "number" ? p.number : null);
const sel = (p) => p?.select?.name || null;
const chk = (p) => !!p?.checkbox;
const rel = (p) => (p?.relation || []).map((r) => r.id);
const files = (p) => (p?.files || []).map((f) => ({ url: f.file?.url || f.external?.url, name: f.name })).filter((f) => f.url);
const rt = (s) => ({ rich_text: s ? [{ text: { content: String(s).slice(0, 1900) } }] : [] });
const ttl = (s) => ({ title: [{ text: { content: String(s).slice(0, 200) } }] });
const norm = (s) => String(s || "").trim().toLowerCase();

// ---------- Load everything ----------
async function load() {
  if (cache && Date.now() - cacheAt < CACHE_MS) return cache;
  const [cRows, lRows, xRows, iRows] = await Promise.all([queryAll(DB.cultures), queryAll(DB.lenses), queryAll(DB.connectors), queryAll(DB.iterations)]);
  const cultures = cRows.map((p) => ({
    pageId: p.id, id: text(P(p, "key")) || p.id, name: text(P(p, "Name")), sub: text(P(p, "subtitle")),
    color: text(P(p, "color")) || "#6b7378", order: num(P(p, "order")) ?? 99, active: chk(P(p, "active")),
    aliases: text(P(p, "aliases")).split(",").map((s) => s.trim()).filter(Boolean),
    pop: num(P(p, "population")), src: text(P(p, "population_source")),
    bearing: num(P(p, "bearing_deg")), walk: num(P(p, "walk_min")), anchor: text(P(p, "anchor")),
  })).sort((a, b) => a.order - b.order);
  const lenses = lRows.map((p) => ({
    pageId: p.id, id: text(P(p, "key")) || p.id, name: text(P(p, "Name")), pillar: sel(P(p, "pillar")) || "community",
    order: num(P(p, "order")) ?? 99, active: chk(P(p, "active")),
    aliases: text(P(p, "aliases")).split(",").map((s) => s.trim()).filter(Boolean),
  })).sort((a, b) => a.order - b.order);
  // resolve a connector's culture/lens: relation first, then select name or alias
  const byPage = (arr, id) => arr.find((x) => x.pageId.replace(/-/g, "") === id.replace(/-/g, ""));
  const byName = (arr, name) => arr.find((x) => norm(x.name) === norm(name) || x.aliases.some((a) => norm(a) === norm(name)));
  const connectors = xRows.map((p) => {
    const cRef = rel(P(p, "culture_ref"))[0], lRef = rel(P(p, "lens_ref"))[0];
    const c = (cRef && byPage(cultures, cRef)) || byName(cultures, sel(P(p, "culture")));
    const l = (lRef && byPage(lenses, lRef)) || byName(lenses, sel(P(p, "dimension")));
    const ev = sel(P(p, "evidence"));
    return {
      id: p.id, c: c?.id || null, d: l?.id || null, linked: !!(cRef && lRef),
      s: Math.min(3, Math.max(1, num(P(p, "strength")) || 1)),
      k: ev === "documented" ? "doc" : "hyp", evidence: ev || "hypothesis",
      t: text(P(p, "title")), n: text(P(p, "overlap")), q: text(P(p, "design_cue")), note: text(P(p, "fieldwork_note")),
      status: sel(P(p, "status")) || "Approved",
      photos: files(P(p, "photos")).slice(0, 6), sound: files(P(p, "sound"))[0] || null, credit: text(P(p, "media_credit")),
      by: text(P(p, "submitted_by")), experienced: chk(P(p, "experienced")), edited: p.last_edited_time,
    };
  });
  const iterations = iRows.map((p) => ({ id: p.id, name: text(P(p, "Name")), isDefault: chk(P(p, "is_default")), by: sel(P(p, "saved_by")), created: p.created_time, settings: safeJSON(text(P(p, "settings_json"))) }))
    .sort((a, b) => (a.created < b.created ? 1 : -1));
  cache = { cultures, lenses, connectors, iterations };
  cacheAt = Date.now();
  return cache;
}
function safeJSON(s) { try { return JSON.parse(s); } catch { return null; } }
const strip = (arr) => arr.map(({ aliases, ...rest }) => rest);

// ---------- Auth ----------
function roleOf(req) {
  const k = req.headers.get("x-lakou-key") || "";
  if (k && process.env.OWNER_KEY && k === process.env.OWNER_KEY) return "owner";
  if (k && process.env.EDITOR_KEY && k === process.env.EDITOR_KEY) return "editor";
  return "visitor";
}
const can = (role, need) => ({ visitor: 0, editor: 1, owner: 2 }[role] >= { visitor: 0, editor: 1, owner: 2 }[need]);

// ---------- Validation ----------
function bad(msg) { const e = new Error(msg); e.status = 400; throw e; }
function str(v, max, name, required) {
  const s = String(v ?? "").trim();
  if (required && !s) bad(`${name} is required`);
  if (s.length > max) bad(`${name} is too long (max ${max} characters)`);
  return s;
}
function connectorProps(f, data, { partial }) {
  const props = {};
  if (!partial || f.title !== undefined) props.title = ttl(str(f.title, 80, "Name", true));
  if (!partial || f.c !== undefined) {
    const c = data.cultures.find((x) => x.id === f.c && x.active);
    if (!c) bad("Pick a culture from the list");
    props.culture_ref = { relation: [{ id: c.pageId }] };
    props.culture = { select: { name: c.name } };
  }
  if (!partial || f.d !== undefined) {
    const l = data.lenses.find((x) => x.id === f.d && x.active);
    if (!l) bad("Pick a lens from the list");
    props.lens_ref = { relation: [{ id: l.pageId }] };
    props.dimension = { select: { name: l.name } };
  }
  if (f.s !== undefined) { const s = Number(f.s); if (![1, 2, 3].includes(s)) bad("Strength must be 1, 2 or 3"); props.strength = { number: s }; }
  if (f.evidence !== undefined) { if (!EVIDENCE.includes(f.evidence)) bad("Unknown evidence type"); props.evidence = { select: { name: f.evidence } }; }
  if (f.n !== undefined) props.overlap = rt(str(f.n, 1500, "Overlap"));
  if (f.q !== undefined) props.design_cue = rt(str(f.q, 800, "Design cue"));
  if (f.note !== undefined) props.fieldwork_note = rt(str(f.note, 1500, "Fieldwork note"));
  if (f.credit !== undefined) props.media_credit = rt(str(f.credit, 400, "Media credit"));
  if (f.status !== undefined) { if (!STATUS.includes(f.status)) bad("Unknown status"); props.status = { select: { name: f.status } }; }
  return props;
}

// ---------- Handlers ----------
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export default async (req) => {
  try {
    if (!process.env.NOTION_TOKEN) return json(500, { error: "NOTION_TOKEN is not set on this site" });
    const role = roleOf(req);

    if (req.method === "GET") {
      const data = await load();
      const visible = can(role, "editor") ? data.connectors : data.connectors.filter((x) => x.status === "Approved");
      const def = data.iterations.find((i) => i.isDefault) || null;
      return json(200, {
        role,
        cultures: strip(data.cultures.filter((c) => c.active || can(role, "owner"))),
        lenses: strip(data.lenses.filter((l) => l.active || can(role, "owner"))),
        connectors: visible.filter((x) => x.c && x.d).map((x) => (can(role, "editor") ? x : { ...x, by: undefined, note: undefined })),
        unlinked: can(role, "owner") ? data.connectors.filter((x) => !x.linked).length : undefined,
        settings: def?.settings || null,
        iterations: can(role, "editor") ? data.iterations.map(({ settings, ...i }) => i) : undefined,
        cachedAt: new Date(cacheAt).toISOString(),
      });
    }

    if (req.method !== "POST") return json(405, { error: "Use GET or POST" });
    const body = await req.json().catch(() => bad("Send JSON"));
    const data = await load();
    const done = (extra = {}) => { cache = null; return json(200, { ok: true, ...extra }); };

    switch (body.action) {
      case "whoami":
        return json(200, { role });

      case "submit": { // public, goes to the review queue
        if (body.website) return json(200, { ok: true }); // honeypot: bots fill hidden fields
        const ip = req.headers.get("x-nf-client-connection-ip") || "x";
        const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 3_600_000);
        if (list.length >= 8) bad("Too many submissions from here in the last hour. Try again later.");
        if (!body.consent) bad("Please agree that your entry can be shown publicly");
        if (!body.experienced && !String(body.source || "").trim()) bad("Add a source link, or tick that you experienced this yourself");
        const props = connectorProps({ title: body.title, c: body.c, d: body.d, n: body.n }, data, { partial: false });
        Object.assign(props, {
          strength: { number: 1 }, evidence: { select: { name: "hypothesis" } }, status: { select: { name: "Submitted" } },
          submitted_by: rt(str(body.by, 80, "Name")), contact: rt(str(body.contact, 120, "Contact")),
          consent: { checkbox: true }, experienced: { checkbox: !!body.experienced },
          fieldwork_note: rt(body.source ? `Source given: ${str(body.source, 400, "Source")}` : "Submitted as lived experience"),
        });
        await notion("/pages", "POST", { parent: { database_id: DB.connectors }, properties: props });
        hits.set(ip, [...list, now]);
        return done({ message: "Thank you. It will appear after review." });
      }

      case "create": {
        if (!can(role, "editor")) bad("Editor password needed");
        const f = body.fields || {};
        const props = connectorProps(f, data, { partial: false });
        props.strength = props.strength || { number: 2 };
        props.evidence = props.evidence || { select: { name: "hypothesis" } };
        props.status = props.status || { select: { name: "Approved" } };
        props.last_edited_by = rt(role);
        const page = await notion("/pages", "POST", { parent: { database_id: DB.connectors }, properties: props });
        return done({ id: page.id });
      }

      case "update": {
        if (!can(role, "editor")) bad("Editor password needed");
        if (!data.connectors.some((x) => x.id === body.id)) bad("That connector doesn't exist");
        const props = connectorProps(body.fields || {}, data, { partial: true });
        props.last_edited_by = rt(role);
        await notion(`/pages/${body.id}`, "PATCH", { properties: props });
        return done();
      }

      case "updateCulture":
      case "createCulture": {
        if (!can(role, "owner")) bad("Owner password needed");
        const f = body.fields || {}, props = {};
        if (f.name !== undefined) props.Name = ttl(str(f.name, 60, "Name", true));
        if (f.sub !== undefined) props.subtitle = rt(str(f.sub, 120, "Subtitle"));
        if (f.color !== undefined) { if (!/^#[0-9a-f]{6}$/i.test(f.color)) bad("Color must be a hex like #27866a"); props.color = rt(f.color); }
        if (f.order !== undefined) props.order = { number: Number(f.order) || 0 };
        if (f.active !== undefined) props.active = { checkbox: !!f.active };
        // population, bearing and walk minutes are locked: they only come from the QGIS import
        if (body.action === "createCulture") {
          const key = str(f.key, 12, "Key", true).toLowerCase();
          if (!/^[a-z0-9]+$/.test(key) || data.cultures.some((c) => c.id === key)) bad("Key must be short, unique letters/numbers");
          props.key = rt(key); props.active = props.active || { checkbox: true };
          await notion("/pages", "POST", { parent: { database_id: DB.cultures }, properties: props });
        } else {
          const c = data.cultures.find((x) => x.id === body.id); if (!c) bad("Unknown culture");
          if (f.name !== undefined && norm(f.name) !== norm(c.name)) props.aliases = rt([...new Set([...c.aliases, c.name])].join(", ")); // old name keeps matching
          await notion(`/pages/${c.pageId}`, "PATCH", { properties: props });
        }
        return done();
      }

      case "updateLens":
      case "createLens": {
        if (!can(role, "owner")) bad("Owner password needed");
        const f = body.fields || {}, props = {};
        if (f.name !== undefined) props.Name = ttl(str(f.name, 40, "Name", true));
        if (f.pillar !== undefined) { if (!PILLARS.includes(f.pillar)) bad("Unknown pillar"); props.pillar = { select: { name: f.pillar } }; }
        if (f.order !== undefined) props.order = { number: Number(f.order) || 0 };
        if (f.active !== undefined) props.active = { checkbox: !!f.active };
        if (body.action === "createLens") {
          const key = str(f.key, 12, "Key", true).toLowerCase();
          if (!/^[a-z0-9]+$/.test(key) || data.lenses.some((l) => l.id === key)) bad("Key must be short, unique letters/numbers");
          props.key = rt(key); props.active = props.active || { checkbox: true };
          await notion("/pages", "POST", { parent: { database_id: DB.lenses }, properties: props });
        } else {
          const l = data.lenses.find((x) => x.id === body.id); if (!l) bad("Unknown lens");
          if (f.name !== undefined && norm(f.name) !== norm(l.name)) props.aliases = rt([...new Set([...l.aliases, l.name])].join(", "));
          await notion(`/pages/${l.pageId}`, "PATCH", { properties: props });
        }
        return done();
      }

      case "saveIteration": {
        if (!can(role, "editor")) bad("Editor password needed");
        const s = JSON.stringify(body.settings || {});
        if (s.length > 1900) bad("Settings are too large to save");
        const isDefault = !!body.makeDefault && can(role, "owner");
        if (isDefault) for (const i of data.iterations.filter((i) => i.isDefault)) await notion(`/pages/${i.id}`, "PATCH", { properties: { is_default: { checkbox: false } } });
        await notion("/pages", "POST", { parent: { database_id: DB.iterations }, properties: {
          Name: ttl(str(body.name, 80, "Name", true)), settings_json: rt(s), is_default: { checkbox: isDefault },
          saved_by: { select: { name: role === "owner" ? "Nick" : "Jennifer" } }, notes: rt(str(body.notes, 400, "Notes")),
        } });
        return done();
      }

      case "loadIteration": {
        if (!can(role, "editor")) bad("Editor password needed");
        const it = data.iterations.find((i) => i.id === body.id); if (!it) bad("Unknown iteration");
        return json(200, { ok: true, settings: it.settings });
      }

      case "linkCatalog": { // one-time: fill culture_ref / lens_ref on older rows from their select names
        if (!can(role, "owner")) bad("Owner password needed");
        let n = 0;
        for (const x of data.connectors.filter((x) => !x.linked && x.c && x.d)) {
          const c = data.cultures.find((k) => k.id === x.c), l = data.lenses.find((k) => k.id === x.d);
          await notion(`/pages/${x.id}`, "PATCH", { properties: { culture_ref: { relation: [{ id: c.pageId }] }, lens_ref: { relation: [{ id: l.pageId }] } } });
          n++;
          await new Promise((r) => setTimeout(r, 350)); // stay under Notion's ~3 requests/second
        }
        return done({ linked: n });
      }

      default:
        bad("Unknown action");
    }
  } catch (e) {
    return json(e.status || 500, { error: e.message || "Something went wrong" });
  }
};
