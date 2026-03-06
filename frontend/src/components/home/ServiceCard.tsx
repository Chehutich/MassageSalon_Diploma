import { View, Text, Pressable, StyleSheet } from "react-native";
import { Clock, Heart, Hand } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import type { ServiceResponse } from "@/src/api/generated/apiV1.schemas";

type Props = {
  item: ServiceResponse;
  accent: string;
  Icon?: React.ComponentType<{
    size: number;
    strokeWidth: number;
    color: string;
  }>;
  liked?: boolean;
  onToggleLike?: () => void;
};

export function ServiceCard({
  item,
  accent,
  Icon = Hand,
  liked = false,
  onToggleLike,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: accent + "18" }]}>
        <Icon size={20} strokeWidth={1.5} color={accent} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.title}</Text>
        <View style={styles.meta}>
          <Clock size={11} strokeWidth={1.8} color={Palette.taupe} />
          <Text style={styles.metaText}>{item.duration} хв</Text>
        </View>
        {item.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>{item.price} ₴</Text>
        <Pressable onPress={onToggleLike} hitSlop={8}>
          <Heart
            size={16}
            strokeWidth={1.6}
            color={liked ? Palette.rose : Palette.taupe}
            fill={liked ? Palette.rose : "none"}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Palette.sand,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  name: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
    marginBottom: 4,
  },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
  },
  description: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.6,
    marginTop: 3,
  },
  right: { alignItems: "flex-end", gap: 8 },
  price: {
    fontSize: 15,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
  },
});
