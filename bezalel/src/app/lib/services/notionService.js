const NOTION_API_URL = "https://api.notion.com/v1";

const DB_TITLE = "Bezalel People";

const PROVIDER_LABELS = {
  explorium: "Explorium",
  bezalel: "Bezalel",
  vibe: "Vibe Prospecting",
};

const STATUS_OPTIONS = [
  { name: "New", color: "blue" },
  { name: "Contacted", color: "yellow" },
  { name: "Replied", color: "green" },
  { name: "Opportunity", color: "purple" },
];

let cachedDatabaseId = null;

function headers() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
}

function configured() {
  return !!process.env.NOTION_API_KEY;
}

function richText(value) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return { rich_text: [{ text: { content: value.slice(0, 2000) } }] };
}

function databaseProperties() {
  return {
    Name: { title: {} },
    Role: { rich_text: {} },
    Summary: { rich_text: {} },
    Signal: { rich_text: {} },
    Hook: { rich_text: {} },
    "ICP Fit": { rich_text: {} },
    "ICP Score": { number: {} },
    Provider: { select: {} },
    Status: { select: { options: STATUS_OPTIONS } },
    Sources: { url: {} },
    "Created At": { date: {} },
  };
}

/**
 * Resolves the Notion database to write into, in priority order:
 *   1. NOTION_DATABASE_ID (an existing database), then
 *   2. a previously auto-created "Bezalel People" database (via search), then
 *   3. a new database created under NOTION_PARENT_PAGE_ID.
 * The resolved id is cached for the lifetime of the server process.
 */
async function resolveDatabaseId() {
  if (cachedDatabaseId) return cachedDatabaseId;
  if (process.env.NOTION_DATABASE_ID) {
    cachedDatabaseId = process.env.NOTION_DATABASE_ID;
    return cachedDatabaseId;
  }
  const search = await fetch(`${NOTION_API_URL}/search`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ filter: { value: "database", property: "object" }, query: DB_TITLE, page_size: 10 }),
  });
  if (search.ok) {
    const data = await search.json();
    const existing = (data.results || []).find((item) => item.object === "database");
    if (existing) {
      cachedDatabaseId = existing.id;
      return cachedDatabaseId;
    }
  }
  const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
  if (!parentPageId) throw new Error("Set NOTION_PARENT_PAGE_ID (or NOTION_DATABASE_ID) to save people to Notion.");
  const create = await fetch(`${NOTION_API_URL}/databases`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: DB_TITLE } }],
      properties: databaseProperties(),
    }),
  });
  if (!create.ok) {
    const detail = await create.text().catch(() => "");
    throw new Error(`Could not create the Notion database (${create.status}): ${detail.slice(0, 200)}`);
  }
  const created = await create.json();
  cachedDatabaseId = created.id;
  return cachedDatabaseId;
}

/**
 * Maps one discovered person to the Notion database properties.
 */
export function buildPersonProperties(person) {
  const properties = {
    Name: {
      title: [{ text: { content: (typeof person.name === "string" && person.name.trim() ? person.name : "Unknown").slice(0, 200) } }],
    },
    Role: richText(person.role),
    Summary: richText(person.summary),
    Signal: richText(person.signal),
    Hook: richText(person.hook),
    "ICP Fit": richText(person.fit),
    "ICP Score": person.score != null ? { number: Math.max(0, Math.min(100, person.score)) } : undefined,
    Provider: {
      select: { name: PROVIDER_LABELS[person.provider] ?? person.provider ?? "Unknown" },
    },
    Status: { select: { name: "New" } },
    Sources: person.sources?.[0] != null ? { url: person.sources[0] } : undefined,
    "Created At": { date: { start: new Date().toISOString() } },
  };
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}

/**
 * Saves one person to the Notion database. Best-effort: returns early (skipped)
 * when Notion is not configured, so research keeps working without credentials.
 */
export async function savePersonToNotion(person) {
  if (!configured()) return { skipped: true };
  const databaseId = await resolveDatabaseId();
  const response = await fetch(`${NOTION_API_URL}/pages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: buildPersonProperties(person),
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Notion save failed (${response.status}): ${detail.slice(0, 200)}`);
  }
  return await response.json();
}

function textOf(prop) {
  if (!prop) return "";
  if (Array.isArray(prop.rich_text)) return prop.rich_text.map((t) => t.plain_text).join(" ").trim();
  if (Array.isArray(prop.title)) return prop.title.map((t) => t.plain_text).join(" ").trim();
  return "";
}

function mapNotionPage(page) {
  const props = page.properties || {};
  return {
    id: page.id,
    url: page.url || `https://www.notion.so/${(page.id || "").replace(/-/g, "")}`,
    name: textOf(props.Name),
    sources: props.Sources?.url ? [props.Sources.url] : [],
    role: textOf(props.Role),
    summary: textOf(props.Summary),
    signal: textOf(props.Signal),
    hook: textOf(props.Hook),
    fit: textOf(props["ICP Fit"]),
    score: typeof props["ICP Score"]?.number === "number" ? props["ICP Score"].number : null,
    status: props.Status?.select?.name ?? null,
    provider: props.Provider?.select?.name ?? null,
    createdAt: props["Created At"]?.date?.start ?? null,
  };
}

/**
 * Reads people back from the Notion database, newest first. Returns
 * { configured, people } so the client can render a friendly empty state when
 * Notion is not wired up yet.
 */
export async function listPeopleFromNotion({ all = false } = {}) {
  if (!configured()) return { configured: false, people: [] };
  const databaseId = await resolveDatabaseId();
  const people = [];
  let cursor;
  do {
    const response = await fetch(`${NOTION_API_URL}/databases/${databaseId}/query`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
        sorts: [{ property: "Created At", direction: "descending" }],
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Notion read failed (${response.status}): ${detail.slice(0, 200)}`);
    }
    const data = await response.json();
    people.push(...(data.results || []).map(mapNotionPage));
    cursor = data.has_more ? data.next_cursor : null;
  } while (all && cursor);
  return { configured: true, people };
}
