const MONTHS: Record<string, number> = {
  enero: 1, ene: 1, january: 1, jan: 1,
  febrero: 2, feb: 2, february: 2,
  marzo: 3, mar: 3, march: 3,
  abril: 4, abr: 4, april: 4, apr: 4,
  mayo: 5, may: 5,
  junio: 6, jun: 6, june: 6,
  julio: 7, jul: 7, july: 7,
  agosto: 8, ago: 8, august: 8, aug: 8,
  septiembre: 9, setiembre: 9, sep: 9, sept: 9, september: 9,
  octubre: 10, oct: 10, october: 10,
  noviembre: 11, nov: 11, november: 11,
  diciembre: 12, dic: 12, december: 12, dec: 12,
};

/**
 * Turns the free-text release date ("2024", "Octubre 2024", "2024-03-15", "15/03/2024")
 * into a sortable number (YYYYMMDD). Unparseable dates return 0 (sorted last).
 */
export function releaseDateScore(text: string): number {
  const t = (text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const year = t.match(/\b(19|20)\d{2}\b/);
  if (!year) return 0;
  const y = Number(year[0]);

  // ISO: 2024-03-15 / 2024/03
  const iso = t.match(/\b(?:19|20)\d{2}[-/](\d{1,2})(?:[-/](\d{1,2}))?/);
  if (iso) return y * 10000 + Number(iso[1]) * 100 + Number(iso[2] || 0);

  // 15/03/2024 or 03/2024
  const dmy = t.match(/\b(?:(\d{1,2})[-/])?(\d{1,2})[-/](?:19|20)\d{2}\b/);
  if (dmy) return y * 10000 + Number(dmy[2]) * 100 + Number(dmy[1] || 0);

  // Month names
  let month = 0;
  for (const word of t.match(/[a-z]+/g) ?? []) {
    if (MONTHS[word]) { month = MONTHS[word]; break; }
  }
  const day = month ? t.match(/\b(\d{1,2})\b(?!\d)/) : null;
  const d = day && Number(day[1]) <= 31 && !/^(19|20)\d{2}$/.test(day[1]) ? Number(day[1]) : 0;
  return y * 10000 + month * 100 + d;
}

/** Newest first. Stable: ties keep their incoming order (API returns newest-created first). */
export function sortByNewest<T extends { releaseDate?: string; year?: string }>(albums: T[]): T[] {
  return [...albums].sort(
    (a, b) => releaseDateScore(b.releaseDate ?? b.year ?? '') - releaseDateScore(a.releaseDate ?? a.year ?? '')
  );
}
