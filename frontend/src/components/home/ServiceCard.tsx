import { useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Clock, Heart, Hand } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { ServiceSheet } from "./ServiceSheet";
import type { ServiceResponse } from "@/src/api/generated/apiV1.schemas";
import { getBadgeConfig } from "@/src/utils/badgeHelpers";

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
  onBook?: () => void;
};

export function ServiceCard({
  item,
  accent,
  Icon = Hand,
  liked = false,
  onToggleLike,
  onBook,
}: Props) {
  const [booked, setBooked] = useState(false);
  const likeScale = useRef(new Animated.Value(1)).current;
  const [sheetOpen, setSheetOpen] = useState(false);
  const badge = getBadgeConfig(item.badge);

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.35,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }),
    ]).start();
    onToggleLike?.();
  };

  return (
    <View
      style={[
        styles.card,
        badge && { borderColor: badge.borderColor, borderWidth: 1.5 },
      ]}
    >
      {/* ── Top: icon + name + like ── */}
      <Pressable style={styles.topRow} onPress={() => setSheetOpen(true)}>
        <View style={[styles.iconBox, { backgroundColor: accent + "18" }]}>
          <Icon size={19} strokeWidth={1.5} color={accent} />
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.meta}>
            <Clock
              size={11}
              strokeWidth={1.8}
              color={Palette.taupe}
              style={{ opacity: 0.65 }}
            />
            <Text style={styles.metaText}>{item.duration} хв</Text>
            {badge && (
              <>
                <Text style={styles.metaDot}>·</Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: badge.bg,
                      borderWidth: 1,
                      borderColor: badge.borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: badge.color }]}>
                    {badge.label}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        <Pressable onPress={handleLike} hitSlop={8} style={styles.likeBtn}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Heart
              size={17}
              strokeWidth={1.6}
              color={liked ? Palette.rose : Palette.taupe + "70"}
              fill={liked ? Palette.rose : "none"}
            />
          </Animated.View>
        </Pressable>
      </Pressable>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Bottom: price + book btn ── */}
      <Pressable style={styles.bottomRow}>
        <Text style={styles.price}>{item.price} ₴</Text>
        <Pressable
          onPress={() => {
            setBooked((v) => !v);
            onBook?.();
          }}
          style={[
            styles.bookBtn,
            booked
              ? {
                  backgroundColor: Palette.sage + "22",
                  borderWidth: 1.5,
                  borderColor: Palette.sage,
                }
              : { backgroundColor: Palette.rose },
          ]}
        >
          <Text
            style={[
              styles.bookText,
              { color: booked ? Palette.sage : Palette.espresso },
            ]}
          >
            {booked ? "Заброньовано" : "Забронювати "}
          </Text>
        </Pressable>
      </Pressable>

      <ServiceSheet
        itemId={sheetOpen ? item.id : null}
        accent={accent}
        Icon={Icon}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    paddingBottom: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Palette.sand,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 11,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, minWidth: 0 },
  name: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
    lineHeight: 20,
  },
  metaDot: {
    fontSize: 11,
    color: Palette.taupe,
    opacity: 0.4,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9.5,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  metaText: {
    fontSize: 11.5,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
  },
  likeBtn: { padding: 4, flexShrink: 0 },
  divider: { height: 1, backgroundColor: Palette.sand },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 2,
  },
  price: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  bookBtn: {
    height: 34,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Palette.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  bookText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 0.3,
  },
});
