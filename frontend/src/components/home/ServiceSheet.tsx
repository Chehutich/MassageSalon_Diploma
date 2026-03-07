import { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, ChevronRight, Sparkle } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { useGetServiceById } from "@/src/api/generated/services/services";
import { MasterShortResponse } from "@/src/api/generated/apiV1.schemas";
import { MasterAvatar } from "@/src/components/MasterAvatar";
import { getBadgeConfig } from "@/src/utils/badgeHelpers";

type Props = {
  itemId: string | null;
  accent: string;
  Icon?: React.ComponentType<{
    size: number;
    strokeWidth: number;
    color: string;
  }>;
  onClose: () => void;
  onBook?: () => void;
};

const SHEET_HEIGHT = 600;

export function ServiceSheet({ itemId, accent, Icon, onClose, onBook }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const { data: item, isLoading } = useGetServiceById(itemId ?? "", {
    query: { enabled: !!itemId },
  });

  const badge = item ? getBadgeConfig(item.badge) : null;

  const slideIn = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
        mass: 0.8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const slideOut = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => cb?.());
  };

  useEffect(() => {
    if (itemId) {
      translateY.setValue(SHEET_HEIGHT);
      opacity.setValue(0);
      slideIn();
    }
  }, [itemId]);

  const handleClose = () => slideOut(onClose);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.5) {
          slideOut(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start();
        }
      },
    }),
  ).current;

  if (!itemId) return null;

  return (
    <Modal
      transparent
      visible={!!itemId}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + 24, transform: [{ translateY }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleWrap} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        {isLoading || !item ? (
          <ActivityIndicator
            color={Palette.taupe}
            style={{ marginVertical: 60 }}
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            scrollEventThrottle={16}
          >
            {/* Icon + Title */}
            <View style={styles.topRow}>
              <View
                style={[styles.iconBox, { backgroundColor: accent + "18" }]}
              >
                {Icon && <Icon size={26} strokeWidth={1.4} color={accent} />}
              </View>
              <Text style={styles.name}>{item.title}</Text>
            </View>

            {/* Pills */}
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
                    {
                      backgroundColor: badge.bg,
                      borderColor: badge.borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.pillText, { color: badge.color }]}>
                    {badge.label}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.divider} />

            {/* Description */}
            {item.description && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Про процедуру</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            )}

            {/* Benefits */}
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
                        <Text style={[styles.benefitCheck, { color: accent }]}>
                          <Sparkle size={11} strokeWidth={1.5} color={accent} />
                        </Text>
                      </View>
                      <Text style={styles.benefitText}>{b}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Masters */}
            {item.masters && item.masters.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Майстри</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -4 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      paddingHorizontal: 4,
                    }}
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

            {/* CTA */}
            <Pressable
              onPress={() => {
                onBook?.();
                handleClose();
              }}
              style={[styles.bookBtn, { backgroundColor: Palette.rose }]}
            >
              <Text style={styles.bookText}>Забронювати · {item.price} ₴</Text>
              <ChevronRight
                size={18}
                strokeWidth={2}
                color={Palette.espresso}
              />
            </Pressable>
          </ScrollView>
        )}
      </Animated.View>
    </Modal>
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
  benefitCheck: { fontSize: 11, fontFamily: "DMSans_500Medium" },
  benefitText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
    opacity: 0.85,
  },
  masterChip: { alignItems: "center", gap: 6 },
  masterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  masterInitials: { fontSize: 15, fontFamily: "DMSans_500Medium" },
  masterName: {
    fontSize: 11.5,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
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
