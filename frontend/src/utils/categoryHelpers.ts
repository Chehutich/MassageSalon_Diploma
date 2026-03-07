// src/utils/categoryHelpers.ts
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
};

const ICONS: Record<string, LucideIcon> = {
  massage: Leaf,
  facial: Sparkles,
  body: Wind,
  energy: Zap,
  relax: Heart,
  wellness: Star,
};

export const categoryColor = (title: string) =>
  COLORS[title.toLowerCase().split(" ")[0]] ?? Palette.taupe;

export const categoryIcon = (title: string) =>
  ICONS[title.toLowerCase().split(" ")[0]] ?? Leaf;
