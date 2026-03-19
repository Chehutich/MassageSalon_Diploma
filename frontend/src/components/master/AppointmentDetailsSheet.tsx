import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
} from "react-native";
import {
  Phone,
  Clock,
  Calendar,
  MessageSquare,
  CreditCard,
  Tag,
} from "lucide-react-native";
import {
  BottomSheet,
  useBottomSheetScroll,
} from "@/src/components/ui/layout/BottomSheet";
import { Palette } from "@/src/theme/tokens";
import { AvatarBadge } from "@/src/components/home/AvatarBadge";
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
} from "@/src/utils/dateHelpers";
import { useGetAppointmentDetails } from "@/src/api/generated/appointments/appointments";

type Props = {
  appointmentId: string | null;
  onClose: () => void;
};

function AppointmentDetailsContent({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const { scrollEnabled, isAtTopRef } = useBottomSheetScroll();

  const { data: appointment, isLoading } =
    useGetAppointmentDetails(appointmentId);

  if (isLoading) {
    return (
      <ActivityIndicator color={Palette.taupe} style={{ marginVertical: 60 }} />
    );
  }

  if (!appointment) {
    return <Text style={styles.errorText}>Запис не знайдено</Text>;
  }

  const initials =
    `${appointment.clientFirstName?.[0] || ""}${appointment.clientLastName?.[0] || ""}`.toUpperCase();

  return (
    <ScrollView
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
      onScroll={(e) => {
        isAtTopRef.current = e.nativeEvent.contentOffset.y <= 0;
      }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.clientCard}>
        <AvatarBadge
          initials={initials}
          photoUrl={appointment.clientPhotoUrl}
          size={58}
        />
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>
            {appointment.clientFirstName} {appointment.clientLastName}
          </Text>
          <Text style={styles.clientStatus}>Клієнт сервісу</Text>
        </View>
        <Pressable
          onPress={() => Linking.openURL(`tel:${appointment.clientPhone}`)}
          style={styles.callBtn}
        >
          <Phone size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Час та послуга</Text>
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Calendar size={18} color={Palette.taupe} />
          </View>
          <Text style={styles.infoText}>
            {formatAppointmentDate(appointment.startTime as string)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Clock size={18} color={Palette.taupe} />
          </View>
          <Text style={styles.infoText}>
            {formatAppointmentTimeRange(
              appointment.startTime as string,
              appointment.endTime as string,
            )}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Tag size={18} color={Palette.taupe} />
          </View>
          <Text style={styles.infoText}>{appointment.serviceName}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Коментар клієнта</Text>
        <View style={styles.notesBox}>
          <MessageSquare
            size={16}
            color={Palette.taupe}
            style={{ marginTop: 2 }}
          />
          <Text style={styles.notesText}>
            {appointment.clientNotes ||
              "Клієнт не залишив додаткових побажань."}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export function AppointmentDetailsSheet({ appointmentId, onClose }: Props) {
  return (
    <BottomSheet
      visible={!!appointmentId}
      onClose={onClose}
      maxHeight="85%"
      title="Деталі запису"
    >
      {appointmentId && (
        <AppointmentDetailsContent appointmentId={appointmentId} />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 40, gap: 24 },
  errorText: {
    textAlign: "center",
    marginVertical: 40,
    color: Palette.taupe,
    fontFamily: "DMSans_400Regular",
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.sand,
  },
  clientInfo: { flex: 1, marginLeft: 16 },
  clientName: {
    fontSize: 18,
    fontFamily: "DMSans_700Bold",
    color: Palette.espresso,
  },
  clientStatus: {
    fontSize: 13,
    color: Palette.taupe,
    opacity: 0.7,
    fontFamily: "DMSans_400Regular",
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Palette.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: Palette.sand },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.6,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Palette.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
  },
  priceText: {
    fontSize: 16,
    fontFamily: "DMSans_700Bold",
    color: Palette.espresso,
  },
  notesBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Palette.sand + "44",
    padding: 16,
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: Palette.sand,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: Palette.espresso,
    lineHeight: 20,
    opacity: 0.8,
    fontFamily: "DMSans_400Regular",
  },
});
