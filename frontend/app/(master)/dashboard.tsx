import React, { useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, CalendarCheck, Phone } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { AmbientBackground } from "@/src/components/ui/layout/AmbientBackground";
import { AvatarBadge } from "@/src/components/home/AvatarBadge";
import { LeafLogo } from "@/src/components/ui/brand/LeafLogo";
import { useGetMe } from "@/src/api/generated/user/user";
import { useGetMySchedule } from "@/src/api/generated/master-personal-cabinet/master-personal-cabinet";
import { signalRService } from "@/src/services/SignalRService";
import { isToday, formatTime } from "@/src/utils/dateHelpers";
import { uk } from "date-fns/locale";
import { AppointmentCard } from "@/src/components/appointments/AppointmentCard";

export default function MasterDashboard() {
  const { data: me } = useGetMe();
  const { data: schedule, refetch } = useGetMySchedule();

  useEffect(() => {
    const connection = signalRService.getConnection();
    if (!connection) return;

    const handleUpdate = () => {
      console.log("🔄 SignalR event received: Refetching...");
      refetch();
    };

    connection.on("ReceiveAppointmentUpdate", handleUpdate);

    return () => {
      console.log("🧹 Cleaning up SignalR listener");
      connection.off("ReceiveAppointmentUpdate", handleUpdate);
    };
  }, [refetch]);

  const { nextAppointment, remainingToday } = useMemo(() => {
    if (!schedule) return { nextAppointment: null, remainingToday: [] };

    const todayAppointments = schedule.filter((a) =>
      isToday(a.startTime as string),
    );
    const next =
      todayAppointments.find(
        (a) => new Date(a.endTime as string) > new Date(),
      ) || todayAppointments[0];

    const remaining = todayAppointments.filter((a) => a.id !== next?.id);

    return { nextAppointment: next, remainingToday: remaining };
  }, [schedule]);

  const initials = me
    ? `${me.firstName[0]}${me.lastName[0]}`.toUpperCase()
    : "??";

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <LeafLogo size={34} />
              <View>
                <Text style={styles.brandTag}>MASTER PANEL</Text>
                <Text style={styles.brandSub}>Робочий простір</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.bellBtn}>
                <Bell size={17} color={Palette.taupe} />
              </Pressable>
              <AvatarBadge
                initials={initials}
                photoUrl={me?.photoUrl}
                size={38}
              />
            </View>
          </View>

          {/* Greeting */}
          <View style={styles.greeting}>
            <Text style={styles.greetTitle}>
              Вітаємо,{"\n"}
              <Text style={styles.greetName}>майстер {me?.firstName} ✦</Text>
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Сьогодні</Text>
              <Text style={styles.statValue}>
                {schedule?.filter((a) => isToday(a.startTime as string))
                  .length || 0}
              </Text>
              <Text style={styles.statSub}>записів</Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: Palette.sage + "20" },
              ]}
            >
              <Text style={styles.statLabel}>Дохід (очік.)</Text>
              <Text style={styles.statValue}>
                {schedule
                  ?.reduce(
                    (acc, curr) => acc + ((curr.price as number) || 0),
                    0,
                  )
                  .toLocaleString()}
              </Text>
              <Text style={styles.statSub}>грн</Text>
            </View>
          </View>

          {/* Next Appointment Section */}
          {/* Next Appointment Section */}
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionTitle}>Зараз / Наступний</Text>
          </View>

          <View
            style={[
              styles.appointmentPreview,
              nextAppointment && styles.focusCard,
            ]}
          >
            <CalendarCheck
              size={24}
              color={nextAppointment ? Palette.sage : Palette.taupe}
              style={{ opacity: nextAppointment ? 1 : 0.5 }}
            />

            <View style={{ flex: 1, marginLeft: 12 }}>
              {nextAppointment ? (
                <>
                  <Text style={styles.focusClientName}>
                    {nextAppointment.clientFirstName}{" "}
                    {nextAppointment.clientLastName}
                  </Text>
                  <Text style={styles.focusService}>
                    {nextAppointment.serviceName} •{" "}
                    {formatTime(nextAppointment.startTime as string)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.clientName}>Немає записів</Text>
                  <Text style={styles.serviceName}>
                    На найближчий час вільно
                  </Text>
                </>
              )}
            </View>

            {nextAppointment?.clientPhone && (
              <Pressable
                onPress={() =>
                  Linking.openURL(`tel:${nextAppointment.clientPhone}`)
                }
                style={styles.callBtn}
              >
                <Phone size={18} color={Palette.ivory} />
              </Pressable>
            )}
          </View>

          {remainingToday.length > 0 && (
            <>
              <View style={[styles.sectionLabel, { marginTop: 20 }]}>
                <Text style={styles.sectionTitle}>Інші записи на сьогодні</Text>
              </View>

              <View style={styles.listContainer}>
                {remainingToday.map((item) => (
                  <View key={item.id} style={styles.listItemWrapper}>
                    <AppointmentCard item={item as any} isMasterView={true} />
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.ivory },
  scroll: { paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 20,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandTag: {
    fontSize: 10,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 1.6,
    color: Palette.taupe,
    opacity: 0.65,
  },
  brandSub: {
    fontSize: 12.5,
    fontFamily: "CormorantGaramond_400Regular",
    color: Palette.taupe,
  },
  headerActions: { flexDirection: "row", gap: 10, alignItems: "center" },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: { paddingHorizontal: 24, marginBottom: 24 },
  greetTitle: {
    fontSize: 28,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.taupe,
    lineHeight: 34,
  },
  focusCard: {
    backgroundColor: "#fff",
    borderLeftWidth: 5,
    borderLeftColor: Palette.sage,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  focusClientName: {
    fontSize: 18,
    fontFamily: "DMSans_700Bold",
    color: Palette.espresso,
  },
  focusService: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  listItemWrapper: {
    marginBottom: 8,
  },
  greetName: {
    fontStyle: "italic",
    fontFamily: "CormorantGaramond_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Palette.sand,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    opacity: 0.7,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "CormorantGaramond_700Bold",
    color: Palette.espresso,
  },
  statSub: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
  },
  sectionLabel: { paddingHorizontal: 24, marginBottom: 12 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
  },
  appointmentPreview: {
    marginHorizontal: 24,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.sand,
    flexDirection: "row",
    alignItems: "center",
  },
  clientName: {
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  serviceName: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    marginTop: 2,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.sage,
    alignItems: "center",
    justifyContent: "center",
  },
});
