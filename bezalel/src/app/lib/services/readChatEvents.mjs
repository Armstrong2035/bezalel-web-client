// Network chunks are not SSE lines: retain partial JSON and UTF-8 between reads.
export async function* readChatEvents(body) {
  if (!body) throw new Error("Chat provider returned an empty response.");
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      pending += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const lines = pending.split("\n");
      pending = lines.pop();
      if (done && pending) lines.push(pending);
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data) continue;
        if (data === "[DONE]") return;
        const event = JSON.parse(data);
        if (event.error) throw new Error(event.error.message || "Chat provider failed.");
        yield event;
      }
      if (done) throw new Error("Chat connection ended early. Please retry.");
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
