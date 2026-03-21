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
import {
  isToday,
  formatTime,
  isTomorrow,
  formatAppointmentDate,
} from "@/src/utils/dateHelpers";
import { AppointmentCard } from "@/src/components/appointments/AppointmentCard";
import { useSheets } from "@/src/context/SheetContext";
import { PLURAL, pluralize } from "@/src/utils/pluralize";
import { router } from "expo-router";

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
    const now = new Date();
    const todayApps =
      schedule?.filter((a) => isToday(a.startTime as string)) || [];

    const sortedToday = [...todayApps].sort(
      (a, b) =>
        new Date(a.startTime as string).getTime() -
        new Date(b.startTime as string).getTime(),
    );

    const currentOrNext = sortedToday.find(
      (a) => new Date(a.endTime as string) > now,
    );

    const breakTime = currentOrNext
      ? formatTime(currentOrNext.endTime as string)
      : "Зараз";

    return {
      count: todayApps.length,
      nextBreak: breakTime,
      // Генерируем текст сразу с плюрализацией
      sessionText: pluralize(todayApps.length, PLURAL.appointment, false),
    };
  }, [schedule]);

  const { nextAppointment, groupedRemaining } = useMemo(() => {
    if (!schedule || schedule.length === 0)
      return { nextAppointment: null, groupedRemaining: {} };

    const now = new Date();

    // 1. Фильтруем:
    // - Либо запись еще не закончилась (предстоящая)
    // - Либо она отменена ("cancelled"), но она на сегодня или будущее
    const upcoming = [...schedule]
      .filter((a) => {
        const isCancelled = a.status?.toLowerCase() === "cancelled";
        const isFutureOrToday =
          new Date(a.endTime as string) > now || isToday(a.startTime as string);

        // Показываем если: (не окончена) ИЛИ (отменена и актуальна по дате)
        return (
          new Date(a.endTime as string) > now ||
          (isCancelled && isFutureOrToday)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.startTime as string).getTime() -
          new Date(b.startTime as string).getTime(),
      );

    // Для главного фокуса (nextAppointment) лучше брать только НЕ отмененную запись
    const next =
      upcoming.find((a) => a.status?.toLowerCase() !== "cancelled") ||
      upcoming[0];

    const remaining = upcoming.filter((a) => a.id !== next?.id);

    const grouped = remaining.reduce(
      (acc, item) => {
        const dateKey = (item.startTime as string).split("T")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
      },
      {} as Record<string, typeof remaining>,
    );

    return { nextAppointment: next, groupedRemaining: grouped };
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
              <Pressable onPress={() => router.replace("/(master)/profile")}>
                <AvatarBadge
                  initials={initials}
                  photoUrl={me?.photoUrl}
                  size={38}
                />
              </Pressable>
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
              <Text style={styles.statSub}>{stats.sessionText} планується</Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: Palette.sage + "10" },
              ]}
            >
              <Text style={styles.statLabel}>Найближча перерва</Text>
              <Text style={styles.statValue}>{stats.nextBreak}</Text>
              <Text style={styles.statSub}>
                {stats.nextBreak === "Зараз"
                  ? "ви вже вільні"
                  : `початок о ${stats.nextBreak}`}
              </Text>
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
          {Object.keys(groupedRemaining).length > 0 && (
            <View style={{ marginTop: 24 }}>
              {Object.entries(groupedRemaining).map(([date, items]) => (
                <View key={date} style={{ marginBottom: 20 }}>
                  {/* Подзаголовок даты */}
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateHeaderText}>
                      {isToday(date)
                        ? "Сьогодні"
                        : isTomorrow(date)
                          ? "Завтра"
                          : formatAppointmentDate(date)}
                    </Text>
                    <View style={styles.dateLine} />
                  </View>

                  <View style={styles.listContainer}>
                    {items.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => openAppointment(item.id)}
                        style={styles.listItemWrapper}
                      >
                        <AppointmentCard
                          item={item as any}
                          isMasterView={true}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </View>
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
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 12,
  },
  dateHeaderText: {
    fontSize: 14,
    fontFamily: "DMSans_700Bold",
    color: Palette.taupe,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.sand,
    opacity: 0.5,
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
