import { Palette } from "@/src/theme/tokens";

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  confirmed: {
    label: "Підтверджений",
    color: Palette.sage,
    bg: Palette.sage + "18",
  },
  completed: {
    label: "Завершений",
    color: Palette.taupe,
    bg: Palette.taupe + "18",
  },
  cancelled: {
    label: "Скасований",
    color: Palette.rose,
    bg: Palette.rose + "18",
  },
  noshow: { label: "Не з'явився", color: "#B8A9C9", bg: "#B8A9C918" },
};

export const FILTERS = [
  { key: "all", label: "Всі" },
  { key: "confirmed", label: "Підтверджені" },
  { key: "completed", label: "Завершені" },
  { key: "cancelled", label: "Скасовані" },
  { key: "noshow", label: "Не з'явився" },
];
