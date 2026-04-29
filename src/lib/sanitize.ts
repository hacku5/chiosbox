/**
 * Strip HTML tags from a string to prevent stored XSS.
 * Simple regex-based approach — sufficient for plain text fields.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Encode HTML entities to prevent reflected XSS.
 */
export function encodeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Normalize unicode — trim, collapse whitespace, remove control chars.
 */
export function normalizeText(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // control chars
    .replace(/\s+/g, " "); // collapse whitespace
}

/**
 * Sanitize and validate a text field.
 * Strips HTML, normalizes, enforces max length.
 */
export function sanitizeText(
  value: unknown,
  maxLength: number = 500
): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = normalizeText(stripHtml(value));
  if (cleaned.length === 0) return undefined;
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitize a required text field. Returns null if invalid.
 */
export function sanitizeRequired(
  value: unknown,
  maxLength: number = 500
): string | null {
  if (typeof value !== "string") return null;
  const cleaned = normalizeText(stripHtml(value));
  if (cleaned.length === 0) return null;
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitize an object's string fields recursively.
 * Only sanitizes known keys, leaves unknown keys untouched.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  keys: string[]
): T {
  const copy: Record<string, unknown> = { ...obj };
  for (const key of keys) {
    if (typeof copy[key] === "string") {
      copy[key] = sanitizeRequired(copy[key] as string) || "";
    }
  }
  return copy as T;
}
