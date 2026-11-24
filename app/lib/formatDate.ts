const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** "2026-04-02" -> "April 2, 2026". Non-ISO (legacy) values are returned as-is. */
export function formatReleaseDate(value: string): string {
  const m = ISO.exec(value);
  if (!m) return value;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const isIsoDate = (value: unknown): value is string =>
  typeof value === 'string' && ISO.test(value);

const MONTH = /^(\d{4})-(\d{2})$/;
export const isMonth = (value: unknown): value is string =>
  typeof value === 'string' && MONTH.test(value) && Number(value.slice(5)) >= 1 && Number(value.slice(5)) <= 12;

/** "2024-01" -> "Jan 2024" */
export function formatMonth(value: string): string {
  const m = MONTH.exec(value);
  if (!m) return value;
  return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
