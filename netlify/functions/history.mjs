import { getStore } from "@netlify/blobs";

// Password for clearing the history. Checked here on the server so it never
// appears in the page source. Can be overridden with a HISTORY_PASSWORD
// environment variable in Netlify if you ever want to change it.
const CLEAR_PASSWORD = process.env.HISTORY_PASSWORD || "Psalm119105";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const str = (v, max = 300) => (typeof v === "string" ? v.slice(0, max) : "");

function cleanEntry(e) {
  if (!e || typeof e !== "object") return null;
  const action = ["added", "edited", "deleted"].includes(e.action) ? e.action : null;
  if (!action) return null;
  const ev = e.event && typeof e.event === "object" ? e.event : {};
  return {
    id: str(e.id, 80) || "h" + Date.now() + Math.random().toString(36).slice(2, 7),
    action,
    by: str(e.by, 80) || "Unknown",
    at: str(e.at, 40) || new Date().toISOString(),
    event: {
      id: str(ev.id, 80),
      title: str(ev.title),
      category: str(ev.category, 40),
      start: str(ev.start, 10),
      end: str(ev.end, 10),
      time: str(ev.time, 100),
      location: str(ev.location),
    },
    changes: Array.isArray(e.changes)
      ? e.changes.slice(0, 20).map((c) => ({
          field: str(c && c.field, 40),
          from: str(c && c.from),
          to: str(c && c.to),
        }))
      : [],
  };
}

export default async (req) => {
  const store = getStore("su-calendar");
  const read = async () => (await store.get("history", { type: "json" })) || [];

  if (req.method === "GET") {
    return json(await read());
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    if (body && body.action === "append") {
      const incoming = (Array.isArray(body.entries) ? body.entries : [])
        .map(cleanEntry)
        .filter(Boolean);
      const history = await read();
      const seen = new Set(history.map((h) => h.id));
      incoming.forEach((e) => {
        if (!seen.has(e.id)) history.push(e);
      });
      await store.setJSON("history", history);
      return json({ ok: true, history });
    }

    if (body && body.action === "clear") {
      const name = str(body.name, 80).trim();
      if (!name) return json({ error: "name_required" }, 400);
      if (body.password !== CLEAR_PASSWORD) return json({ error: "wrong_password" }, 401);
      const history = [
        {
          id: "h" + Date.now(),
          action: "cleared",
          by: name,
          at: new Date().toISOString(),
        },
      ];
      await store.setJSON("history", history);
      return json({ ok: true, history });
    }

    return json({ error: "Unknown action" }, 400);
  }

  return new Response("Method not allowed", { status: 405 });
};
