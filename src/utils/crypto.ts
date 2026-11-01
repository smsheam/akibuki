export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFC')
    // Remove common punctuation and emojis
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’‘।॥]/g, '')
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    .trim();
}

export async function sha256Hex(text: string): Promise<string> {
  const normalized = normalizeText(text);
  if (!normalized) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function computeHashes(texts: string[]): Promise<string[]> {
  const hashes = await Promise.all(texts.map((t) => sha256Hex(t)));
  return Array.from(new Set(hashes.filter(Boolean)));
}
