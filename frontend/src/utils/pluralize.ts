function getPluralForm(n: number): 0 | 1 | 2 {
  const abs = Math.abs(n) % 100;
  const mod10 = abs % 10;

  if (abs >= 11 && abs <= 19) return 2; // 11–19 → "сеансів"
  if (mod10 === 1) return 0; // 1, 21, 31 → "сеанс"
  if (mod10 >= 2 && mod10 <= 4) return 1; // 2–4, 22–24 → "сеанси"
  return 2; // решта → "сеансів"
}

export function pluralize(
  n: number,
  forms: readonly [string, string, string],
  showNumber = true,
): string {
  const word = forms[getPluralForm(n)];
  return showNumber ? `${n} ${word}` : word;
}

export const PLURAL = {
  session: ["сеанс", "сеанси", "сеансів"] as const,
  master: ["майстер", "майстри", "майстрів"] as const,
  service: ["послуга", "послуги", "послуг"] as const,
  minute: ["хвилина", "хвилини", "хвилин"] as const,
  hour: ["година", "години", "годин"] as const,
  day: ["день", "дні", "днів"] as const,
  point: ["бал", "бали", "балів"] as const,
  review: ["відгук", "відгуки", "відгуків"] as const,
  category: ["категорія", "категорії", "категорій"] as const,
  appointment: ["запис", "записи", "записів"] as const,
};
