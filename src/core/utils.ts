export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function bucketize(
  value: number,
  thresholds: [number, number],
  labels: [string, string, string]
) {
  if (value <= thresholds[0]) return labels[0];
  if (value <= thresholds[1]) return labels[1];
  return labels[2];
}

export function normalizeText(rawText: string) {
  const normalized = rawText.replace(/\r\n?/g, "\n");
  const lines = normalized
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trimEnd());
  return lines.join("\n").trim();
}

export function countWords(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countLines(text: string) {
  if (!text.trim()) return 0;
  return text.split(/\n/).length;
}

export function countStanzas(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n\s*\n/).length;
}

export function textHash(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
