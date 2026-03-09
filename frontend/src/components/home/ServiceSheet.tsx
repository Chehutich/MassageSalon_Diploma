import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Clock, ChevronRight, Sparkle } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { useGetServiceById } from "@/src/api/generated/services/services";
import type { MasterShortResponse } from "@/src/api/generated/apiV1.schemas";
import { MasterAvatar } from "@/src/components/MasterAvatar";
import { getBadgeConfig } from "@/src/utils/badgeHelpers";
import * as categoryHelpers from "@/src/utils/categoryHelpers";
import {
  BottomSheet,
  useBottomSheetScroll,
} from "@/src/components/BottomSheet";

type Props = {
  itemId: string | null;
  onClose: () => void;
  onBook?: () => void;
};

type ContentProps = Props & {
  onTitleLoad?: (title: string) => void;
};

function ServiceSheetContent({
  itemId,
  onClose,
  onBook,
  onTitleLoad,
}: ContentProps) {
  const { scrollEnabled, isAtTopRef } = useBottomSheetScroll();
  const { data: item, isLoading } = useGetServiceById(itemId ?? "", {
    query: { enabled: !!itemId },
  });

  useEffect(() => {
    if (item?.title) {
      onTitleLoad?.(item.title);
    }
  }, [item?.title]);

  const badge = item ? getBadgeConfig(item.badge) : null;

  const accent = item?.categorySlug
    ? categoryHelpers.categoryColor(item.categorySlug)
    : Palette.taupe;
  const Icon = item?.categorySlug
    ? categoryHelpers.categoryIcon(item.categorySlug)
    : Sparkle;

  if (isLoading || !item) {
    return (
      <ActivityIndicator color={Palette.taupe} style={{ marginVertical: 60 }} />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        scrollEventThrottle={16}
        onScroll={(e) => {
          isAtTopRef.current = e.nativeEvent.contentOffset.y <= 0;
        }}
      >
        <View style={styles.pills}>
          <View style={styles.pill}>
            <Clock size={13} strokeWidth={1.8} color={Palette.taupe} />
            <Text style={styles.pillText}>{item.duration} хв</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillPrice}>{item.price} ₴</Text>
          </View>
          {badge && (
            <View
              style={[
                styles.pill,
                { backgroundColor: badge.bg, borderColor: badge.borderColor },
              ]}
            >
              <Text style={[styles.pillText, { color: badge.color }]}>
                {badge.label}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {item.description && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Про процедуру</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}

        {item.benefits && item.benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Переваги</Text>
            <View style={{ gap: 8 }}>
              {item.benefits.map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <View
                    style={[
                      styles.benefitDot,
                      { backgroundColor: accent + "18" },
                    ]}
                  >
                    <Sparkle size={11} strokeWidth={1.5} color={accent} />
                  </View>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {item.masters && item.masters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Майстри</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View
                style={{ flexDirection: "row", gap: 10, paddingHorizontal: 4 }}
              >
                {item.masters.map((m: MasterShortResponse) => (
                  <View key={m.id} style={styles.masterChip}>
                    <MasterAvatar
                      firstName={m.firstName}
                      lastName={m.lastName}
                      photoUrl={m.photoUrl}
                      size={48}
                      accent={accent}
                    />
                    <Text style={styles.masterName}>{m.firstName}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.divider} />
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            onBook?.();
            onClose();
          }}
          style={({ pressed }) => [
            styles.bookBtn,
            { backgroundColor: Palette.rose, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.bookText}>Забронювати · {item.price} ₴</Text>
          <ChevronRight size={18} strokeWidth={2} color={Palette.espresso} />
        </Pressable>
      </View>
    </View>
  );
}

export function ServiceSheet(props: Props) {
  const [dynamicTitle, setDynamicTitle] = useState("Послуга");

  const { data: item } = useGetServiceById(props.itemId ?? "", {
    query: { enabled: !!props.itemId },
  });

  const accent = item?.categorySlug
    ? categoryHelpers.categoryColor(item.categorySlug)
    : Palette.taupe;
  const Icon = item?.categorySlug
    ? categoryHelpers.categoryIcon(item.categorySlug)
    : Sparkle;

  return (
    <BottomSheet
      visible={!!props.itemId}
      onClose={props.onClose}
      maxHeight="88%"
      title={
        <View>
          <Text style={styles.name}>{dynamicTitle}</Text>
        </View>
      }
      headerLeft={
        <View
          style={{
            backgroundColor: accent + "18",
            padding: 8,
            borderRadius: 12,
          }}
        >
          <Icon size={24} color={accent} />
        </View>
      }
    >
      {props.itemId && (
        <ServiceSheetContent {...props} onTitleLoad={setDynamicTitle} />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(74,59,50,0.45)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Palette.ivory,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 99,
    backgroundColor: Palette.sandDark,
  },
  content: { paddingHorizontal: 24, paddingBottom: 8, gap: 18 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  name: {
    flex: 1,
    fontSize: 20,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
    lineHeight: 26,
  },
  pills: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Palette.sand,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
  },
  pillPrice: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  divider: { height: 1, backgroundColor: Palette.sand },
  section: { gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 1,
    color: Palette.taupe,
    opacity: 0.55,
    textTransform: "uppercase",
  },
  description: {
    fontSize: 14.5,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
    lineHeight: 24,
    opacity: 0.88,
  },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  benefitDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
    opacity: 0.85,
  },
  masterChip: { alignItems: "center", gap: 6 },
  masterName: {
    fontSize: 11.5,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 12,
    backgroundColor: Palette.ivory,
  },
  bookBtn: {
    height: 58,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bookText: {
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
    letterSpacing: 0.6,
  },
});
