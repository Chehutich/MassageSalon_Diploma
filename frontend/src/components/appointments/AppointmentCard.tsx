import { View, Text, Pressable, StyleSheet } from "react-native";
import { Banknote, Calendar, Clock } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { STATUS_CONFIG } from "./appointmentHelpers";
import type { MyAppointmentResponse } from "@/src/api/generated/apiV1.schemas";

type Props = {
  item: MyAppointmentResponse;
  onBookAgain?: (serviceId: string, masterId: string | null) => void;
  onCancelPress?: (item: MyAppointmentResponse) => void;
};

export function AppointmentCard({ item, onBookAgain, onCancelPress }: Props) {
  const status =
    STATUS_CONFIG[item.status?.toLowerCase() ?? ""] ?? STATUS_CONFIG.confirmed;

  const startDate = new Date(item.startTime as string);
  const endDate = new Date(item.endTime as string);

  const dateStr = startDate.toLocaleDateString("uk-UA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeStr = `${startDate.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  })} – ${endDate.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const now = Date.now();
  const timeDifferenceMs = startDate.getTime() - now;
  const ONE_HOUR_MS = 60 * 60 * 1000;

  const canCancel = timeDifferenceMs > ONE_HOUR_MS;

  return (
    <View style={styles.card}>
      {/* ── Top row: service + status ── */}
      <View style={styles.topRow}>
        <View
          style={[styles.accentIcon, { backgroundColor: status.color + "18" }]}
        >
          <View style={[styles.accentDot, { backgroundColor: status.color }]} />
        </View>
        <Text style={styles.serviceName} numberOfLines={1}>
          {item.serviceName}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Meta: master + date + time + price ── */}
      <View style={styles.metaBlock}>
        <View style={styles.masterRow}>
          <Text style={styles.masterName}>
            {item.masterFirstName} {item.masterLastName}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar
              size={12}
              strokeWidth={1.8}
              color={Palette.taupe}
              style={{ opacity: 0.7 }}
            />
            <Text style={styles.metaText}>{dateStr}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock
              size={12}
              strokeWidth={1.8}
              color={Palette.taupe}
              style={{ opacity: 0.7 }}
            />
            <Text style={styles.metaText}>{timeStr}</Text>
          </View>
          <View style={styles.price}>
            <Banknote
              size={12}
              strokeWidth={1.8}
              color={Palette.taupe}
              style={{ opacity: 0.7 }}
            />
            <Text style={styles.metaText}>{item.actualPrice} ₴</Text>
          </View>
        </View>
      </View>

      {/* ── Actions ── */}
      {item.status?.toLowerCase() === "confirmed" ? (
        <View style={styles.actions}>
          {canCancel && (
            <Pressable
              style={styles.btnPrimary}
              onPress={() => onCancelPress?.(item)}
            >
              <Text style={styles.btnPrimaryText}>Скасувати</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable
          style={styles.btnPrimary}
          onPress={() => {
            if (item.serviceId) {
              console.log(
                "Booking again:",
                item.serviceId,
                item.masterId ?? null,
              );
              onBookAgain?.(item.serviceId, item.masterId ?? null);
            }
          }}
        >
          <Text style={styles.btnPrimaryText}>Забронювати ще раз</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.sand,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2,
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  accentIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  serviceName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11.5, fontFamily: "DMSans_500Medium" },
  divider: { height: 1, backgroundColor: Palette.sand, borderRadius: 1 },
  metaBlock: { gap: 10 },
  masterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  masterName: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
  },
  metaRow: {
    flexDirection: "row",
    gap: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
  },
  price: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  actions: { flexDirection: "row", gap: 10 },
  btnSecondary: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.sand,
    borderWidth: 1,
    borderColor: Palette.sandDark,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
  },
  btnPrimary: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.rose,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Palette.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  btnPrimaryText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
});
