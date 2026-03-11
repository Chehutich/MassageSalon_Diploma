import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import {
  Banknote,
  Calendar,
  Clock,
  MessageSquare,
  Phone,
} from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { STATUS_CONFIG } from "./appointmentHelpers";
import type { MyAppointmentResponse } from "@/src/api/generated/apiV1.schemas";
import {
  checkCanCancel,
  formatAppointmentDate,
  formatAppointmentTimeRange,
} from "@/src/utils/dateHelpers";

type Props = {
  item: any;
  onBookAgain?: (serviceId: string, masterId: string | null) => void;
  onCancelPress?: (item: any) => void;
  isMasterView?: boolean;
};

export function AppointmentCard({
  item,
  onBookAgain,
  onCancelPress,
  isMasterView,
}: Props) {
  const status =
    STATUS_CONFIG[item.status?.toLowerCase() ?? ""] ?? STATUS_CONFIG.confirmed;

  const dateStr = formatAppointmentDate(item.startTime as string);
  const timeStr = formatAppointmentTimeRange(
    item.startTime as string,
    item.endTime as string,
  );

  const canCancel = checkCanCancel(item.startTime as string);

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
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Meta Block ── */}
      <View style={styles.metaBlock}>
        <View style={styles.mainInfoRow}>
          <Text style={styles.mainInfoText}>
            {isMasterView
              ? `${item.clientFirstName} ${item.clientLastName}`
              : `${item.masterFirstName} ${item.masterLastName}`}
          </Text>

          {isMasterView && item.clientPhone && (
            <Pressable
              onPress={() => Linking.openURL(`tel:${item.clientPhone}`)}
              style={styles.miniCallBtn}
            >
              <Phone size={14} color={Palette.sage} />
            </Pressable>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={12} color={Palette.taupe} style={{ opacity: 0.7 }} />
            <Text style={styles.metaText}>{timeStr}</Text>
          </View>
          <View style={styles.price}>
            <Banknote
              size={12}
              color={Palette.taupe}
              style={{ opacity: 0.7 }}
            />
            <Text style={styles.metaText}>
              {item.price ?? item.actualPrice} ₴
            </Text>
          </View>
          {!isMasterView && (
            <View style={styles.metaItem}>
              <Calendar
                size={12}
                color={Palette.taupe}
                style={{ opacity: 0.7 }}
              />
              <Text style={styles.metaText}>{dateStr}</Text>
            </View>
          )}
        </View>

        {isMasterView && item.clientNotes && (
          <View style={styles.notesContainer}>
            <MessageSquare
              size={12}
              color={Palette.taupe}
              style={{ marginTop: 2 }}
            />
            <Text style={styles.notesText} numberOfLines={2}>
              {item.clientNotes}
            </Text>
          </View>
        )}
      </View>

      {!isMasterView && (
        <View style={styles.actions}>
          {item.status?.toLowerCase() === "confirmed" ? (
            canCancel && (
              <Pressable
                style={styles.btnPrimary}
                onPress={() => onCancelPress?.(item)}
              >
                <Text style={styles.btnPrimaryText}>Скасувати</Text>
              </Pressable>
            )
          ) : (
            <Pressable
              style={styles.btnPrimary}
              onPress={() =>
                item.serviceId &&
                onBookAgain?.(item.serviceId, item.masterId ?? null)
              }
            >
              <Text style={styles.btnPrimaryText}>Забронювати ще раз</Text>
            </Pressable>
          )}
        </View>
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
    gap: 12,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontFamily: "DMSans_500Medium" },
  divider: { height: 1, backgroundColor: Palette.sand, opacity: 0.5 },
  metaBlock: { gap: 8 },
  mainInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mainInfoText: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
  },
  miniCallBtn: {
    padding: 6,
    backgroundColor: Palette.sage + "15",
    borderRadius: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
  },
  price: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  notesContainer: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: Palette.sand + "30",
    padding: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    lineHeight: 16,
    fontStyle: "italic",
  },
  actions: { marginTop: 4 },
  btnPrimary: {
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.rose,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
});
