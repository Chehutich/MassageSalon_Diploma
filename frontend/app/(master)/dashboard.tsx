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
import { Bell, Phone } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { AmbientBackground } from "@/src/components/ui/layout/AmbientBackground";
import { AvatarBadge } from "@/src/components/home/AvatarBadge";
import { LeafLogo } from "@/src/components/ui/brand/LeafLogo";
import { useGetMe } from "@/src/api/generated/user/user";
import { useGetMySchedule } from "@/src/api/generated/master-personal-cabinet/master-personal-cabinet";
import { signalRService } from "@/src/services/SignalRService";
import { isToday, formatTime } from "@/src/utils/dateHelpers";
import { AppointmentCard } from "@/src/components/appointments/AppointmentCard";
import { useSheets } from "@/src/context/SheetContext";

export default function MasterDashboard() {
  const { data: me } = useGetMe();
  const { data: schedule, refetch } = useGetMySchedule();
  const { openAppointment } = useSheets();

  useEffect(() => {
    const connection = signalRService.getConnection();
    if (!connection) return;

    const handleUpdate = () => {
      console.log("🔄 SignalR event received: Refetching...");
      refetch();
    };

    connection.on("ReceiveAppointmentUpdate", handleUpdate);

    return () => {
      connection.off("ReceiveAppointmentUpdate", handleUpdate);
    };
  }, [refetch]);

  const stats = useMemo(() => {
    const todayApps =
      schedule?.filter((a) => isToday(a.startTime as string)) || [];
    const totalMinutes = todayApps.reduce(
      (acc, curr) => acc + (Number(curr.duration) || 0),
      0,
    );
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return {
      count: todayApps.length,
      workTime: hours > 0 ? `${hours}г ${mins}хв` : `${mins}хв`,
    };
  }, [schedule]);

  const { nextAppointment, remainingToday } = useMemo(() => {
    if (!schedule || schedule.length === 0)
      return { nextAppointment: null, remainingToday: [] };

    const now = new Date();

    const upcoming = [...schedule]
      .filter((a) => new Date(a.endTime as string) > now)
      .sort(
        (a, b) =>
          new Date(a.startTime as string).getTime() -
          new Date(b.startTime as string).getTime(),
      );

    const next = upcoming[0];
    const remaining = upcoming.filter(
      (a) => a.id !== next?.id && isToday(a.startTime as string),
    );

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

          {/* Stats Section */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Записи сьогодні</Text>
              <Text style={styles.statValue}>{stats.count}</Text>
              <Text style={styles.statSub}>сеансів</Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: Palette.taupe + "10" },
              ]}
            >
              <Text style={styles.statLabel}>Час у роботі</Text>
              <Text style={styles.statValue}>{stats.workTime}</Text>
              <Text style={styles.statSub}>зайнятість</Text>
            </View>
          </View>

          {/* Next Appointment Section */}
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionTitle}>Зараз / Наступний</Text>
          </View>

          <Pressable
            onPress={() =>
              nextAppointment && openAppointment(nextAppointment.id)
            }
            style={({ pressed }) => [{ opacity: pressed ? 0.96 : 1 }]}
          >
            <View
              style={[
                styles.appointmentPreview,
                nextAppointment && styles.focusCard,
              ]}
            >
              <View style={styles.timeColumn}>
                {nextAppointment && (
                  <View style={[styles.dateTag, { marginBottom: 4 }]}>
                    <Text style={styles.dateTagText}>
                      {isToday(nextAppointment.startTime as string)
                        ? "СЬОГОДНІ"
                        : "ЗАВТРА"}
                    </Text>
                  </View>
                )}
                <Text style={styles.timeText}>
                  {nextAppointment
                    ? formatTime(nextAppointment.startTime as string)
                    : "--:--"}
                </Text>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: nextAppointment
                        ? Palette.sage
                        : Palette.sand,
                    },
                  ]}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 16 }}>
                {nextAppointment ? (
                  <>
                    <Text style={styles.focusServiceTitle} numberOfLines={2}>
                      {nextAppointment.serviceName}
                    </Text>

                    <Text style={styles.clientSubName}>
                      Клієнт: {nextAppointment.clientFirstName}{" "}
                      {nextAppointment.clientLastName}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.clientName}>Вільний час</Text>
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
          </Pressable>
          {remainingToday.length > 0 && (
            <>
              <View style={[styles.sectionLabel, { marginTop: 24 }]}>
                <Text style={styles.sectionTitle}>Інші записи на сьогодні</Text>
              </View>
              <View style={styles.listContainer}>
                {remainingToday.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => openAppointment(item.id)}
                  >
                    <View style={styles.listItemWrapper}>
                      <AppointmentCard item={item as any} isMasterView={true} />
                    </View>
                  </Pressable>
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
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    opacity: 0.7,
    marginBottom: 8,
    textTransform: "uppercase",
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
  focusCard: {
    borderLeftWidth: 5,
    borderLeftColor: Palette.sage,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  timeColumn: {
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: Palette.sand,
    paddingRight: 12,
  },
  timeText: {
    fontSize: 15,
    fontFamily: "DMSans_700Bold",
    color: Palette.espresso,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },

  dateTag: {
    backgroundColor: Palette.sage + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Palette.sage + "30",
  },
  dateTagText: {
    fontSize: 8,
    fontFamily: "DMSans_700Bold",
    color: Palette.sage,
    letterSpacing: 0.5,
  },

  focusServiceTitle: {
    fontSize: 17,
    fontFamily: "DMSans_700Bold",
    color: Palette.espresso,
    marginBottom: 2,
  },
  clientSubName: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.8,
  },

  clientName: {
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  listContainer: { paddingHorizontal: 24 },
  listItemWrapper: { marginBottom: 12 },

  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Palette.sage,
    alignItems: "center",
    justifyContent: "center",
  },
});
