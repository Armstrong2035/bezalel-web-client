export async function readResearchStream(response, onEvent) {
  if (!response.ok) {
    const raw = await response.text().catch(() => "");
    let error = {};
    try { error = raw ? JSON.parse(raw) : {}; } catch { /* Next may return an HTML error page when the dev server is stale. */ }
    const detail = error.error || (raw && !raw.trimStart().startsWith("<!DOCTYPE") ? raw.slice(0, 300) : "");
    throw new Error(detail || `Research request failed (${response.status}). Restart the app and retry.`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;
  const consume = line => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type === "error") throw new Error(event.message);
    if (event.type === "done") done = true;
    onEvent(event);
  };
  try {
    while (true) {
      const chunk = await reader.read();
      buffer += chunk.done ? decoder.decode() : decoder.decode(chunk.value, { stream: true });
      const lines = buffer.split("\n"); buffer = lines.pop();
      for (const line of lines) consume(line);
      if (chunk.done) break;
    }
    consume(buffer);
    if (!done) throw new Error("Research connection ended early. Completed profiles have been retained.");
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
