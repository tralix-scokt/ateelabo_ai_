// Shared incremental SSE decoder. Handles split UTF-8 characters and network frames.
export async function* readEvents(source) {
  const decoder = new TextDecoder();
  let pending = "";
  async function* chunks() {
    if (source.getReader) {
      const reader = source.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) return;
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    } else yield* source;
  }
  for await (const chunk of chunks()) {
    pending +=
      typeof chunk === "string"
        ? chunk
        : decoder.decode(chunk, { stream: true });
    pending = pending.replace(/\r\n/g, "\n");
    let boundary;
    while ((boundary = pending.indexOf("\n\n")) !== -1) {
      const frame = pending.slice(0, boundary);
      pending = pending.slice(boundary + 2);
      const data = frame
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (data && data !== "[DONE]") yield JSON.parse(data);
    }
    if (pending.length > 1024 * 1024) throw new Error("Oversized event stream");
  }
  pending += decoder.decode();
  if (pending.trim()) throw new Error("Incomplete event stream");
}
