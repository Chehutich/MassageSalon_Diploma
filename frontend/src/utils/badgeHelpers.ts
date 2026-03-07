import { Palette } from "@/src/theme/tokens";

type BadgeConfig = {
  label: string;
  color: string;
  borderColor: string;
  bg: string;
};

const BADGE_MAP: Record<string, BadgeConfig> = {
  Popular: {
    label: "Популярне",
    color: Palette.rose,
    borderColor: Palette.rose + "55",
    bg: Palette.rose + "12",
  },
  New: {
    label: "Новинка",
    color: Palette.sage,
    borderColor: Palette.sage + "55",
    bg: Palette.sage + "12",
  },
  Recommended: {
    label: "Рекомендуємо",
    color: "#B8A9C9",
    borderColor: "#B8A9C955",
    bg: "#B8A9C912",
  },
  Discount: {
    label: "Знижка",
    color: "#C4A882",
    borderColor: "#C4A88255",
    bg: "#C4A88212",
  },
};

export function getBadgeConfig(badge: string | null): BadgeConfig | null {
  if (!badge) return null;
  return BADGE_MAP[badge] ?? null;
}
