import { Leaf, Sparkles, Wind, Zap, Heart, Star } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import type { LucideIcon } from "lucide-react-native";

const COLORS: Record<string, string> = {
  massage: Palette.rose,
  facial: Palette.sage,
  body: "#C4A882",
  energy: "#B8A9C9",
  relax: Palette.taupe,
  wellness: "#A8C5B5",
  spa: "#A8C5B5",
};

const ICONS: Record<string, LucideIcon> = {
  massage: Leaf,
  spa: Sparkles,
  body: Wind,
  energy: Zap,
  relax: Heart,
  wellness: Star,
};

export function categoryLabel(slug: string): string {
  const map: Record<string, string> = {
    massage: "Масаж",
    facial: "Догляд за обличчям",
    body: "Догляд за тілом",
    nails: "Нігті",
    hair: "Волосся",
    spa: "Спа",
  };
  return map[slug] ?? slug;
}

export const categoryColor = (slug: string) =>
  COLORS[slug.toLowerCase().split(" ")[0]] ?? Palette.taupe;

export const categoryIcon = (slug: string): LucideIcon => {
  console.log("slug:", slug);
  const key = Object.keys(ICONS).find((k) => slug.toLowerCase().includes(k));
  return key ? ICONS[key] : Leaf;
};
