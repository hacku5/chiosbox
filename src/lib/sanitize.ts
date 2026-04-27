/**
 * Strip HTML tags from a string to prevent stored XSS.
 * Simple regex-based approach — sufficient for plain text fields.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize and validate a text field.
 * Strips HTML, enforces max length, returns undefined for empty strings.
 */
export function sanitizeText(
  value: unknown,
  maxLength: number = 500
): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = stripHtml(value);
  if (cleaned.length === 0) return undefined;
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitize a required text field.
 * Returns null if invalid.
 */
export function sanitizeRequired(
  value: unknown,
  maxLength: number = 500
): string | null {
  if (typeof value !== "string") return null;
  const cleaned = stripHtml(value);
  if (cleaned.length === 0) return null;
  return cleaned.slice(0, maxLength);
}
