const clean = value => typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "";

export function personKeys(person) {
  const keys = [];
  if (person.prospect_id) keys.push(`explorium:${person.prospect_id}`);
  for (const value of [person.linkedin, ...(person.sources || [])]) {
    if (typeof value !== "string") continue;
    const match = value.match(/^(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\/in\/([^/?#]+)/i);
    if (match) keys.push(`linkedin:${match[1].toLowerCase()}`);
  }
  const name = clean(person.name || person.full_name);
  const role = clean(person.role || [person.job_title, person.company_name].filter(Boolean).join(" at "));
  if (name && role) keys.push(`name-role:${name}|${role}`);
  return [...new Set(keys)];
}
