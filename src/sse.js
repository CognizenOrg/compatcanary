export function parseSSE(payload) {
  const normalized = payload.replace(/\r\n/g, "\n");
  const frames = normalized.split(/\n\n+/);
  const events = [];

  for (const frame of frames) {
    if (!frame.trim()) continue;
    let eventName = "message";
    const dataLines = [];

    for (const line of frame.split("\n")) {
      if (!line || line.startsWith(":")) continue;
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim() || "message";
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (dataLines.length === 0) continue;
    const data = dataLines.join("\n");
    if (data === "[DONE]") {
      events.push({ event: eventName, data, done: true, json: null });
      continue;
    }

    let json = null;
    try {
      json = JSON.parse(data);
    } catch {
      // Keep the raw data. The caller decides whether JSON is mandatory.
    }
    events.push({ event: eventName, data, done: false, json });
  }

  return events;
}
