export const pluralizeUk = (
  n: number,
  forms: [string, string, string],
): string => {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  if (mod100 >= 11 && mod100 <= 19) return forms[2]; // 11-19 → записів
  if (mod10 === 1) return forms[0]; // 1     → запис
  if (mod10 >= 2 && mod10 <= 4) return forms[1]; // 2-4   → записи
  return forms[2]; // 5+    → записів
};
