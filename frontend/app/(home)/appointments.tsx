import { useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { TopToast, ToastConfig } from "@/src/components/TopToast";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { Palette } from "@/src/theme/tokens";
import { AmbientBackground } from "@/src/components/AmbientBackground";
import {
  useCancelAppointment,
  useGetMyAppointments,
  getGetMyAppointmentsQueryKey,
} from "@/src/api/generated/appointments/appointments";
import { AppointmentSection } from "@/src/components/appointments/AppointmentSection";
import { BookingSheet } from "@/src/components/booking/BookingSheet";
import { FILTERS } from "@/src/components/appointments/appointmentHelpers";
import { PLURAL, pluralize } from "@/src/utils/pluralize";
import { MyAppointmentResponse } from "@/src/api/generated/apiV1.schemas";
import { CancelConfirmModal } from "@/src/components/appointments/CancelConfirmModal";
import { useToast } from "@/src/context/ToastContext";
import { useSheets } from "@/src/context/SheetContext";

export default function AppointmentsScreen() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const [bookingMasterId, setBookingMasterId] = useState<string | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<MyAppointmentResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const { openBooking, openService, openMaster } = useSheets();

  const { showToast } = useToast();

  const queryClient = useQueryClient();

  const {
    data: appointments,
    isLoading,
    refetch,
  } = useGetMyAppointments({
    query: { staleTime: 0 },
  });

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const FIVE_MINUTES = 5 * 60 * 1000;
      if (now - lastFetchRef.current > FIVE_MINUTES) {
        lastFetchRef.current = now;
        refetch();
      }
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const cancelAppointmentMutation = useCancelAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetMyAppointmentsQueryKey(),
        });
      },
    },
  });

  const filtered = useMemo(() => {
    if (!appointments) return [];
    if (activeFilter === "all") return appointments;
    return appointments.filter((a) => a.status?.toLowerCase() === activeFilter);
  }, [appointments, activeFilter]);

  const grouped = useMemo(
    () => ({
      confirmed: filtered.filter(
        (a) => a.status?.toLowerCase() === "confirmed",
      ),
      completed: filtered.filter(
        (a) => a.status?.toLowerCase() === "completed",
      ),
      cancelled: filtered.filter(
        (a) => a.status?.toLowerCase() === "cancelled",
      ),
      noshow: filtered.filter((a) => a.status?.toLowerCase() === "noshow"),
    }),
    [filtered],
  );

  const handleBookAgain = (serviceId: string, masterId: string | null) => {
    openBooking(serviceId, masterId);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel?.id) return;
    try {
      await cancelAppointmentMutation.mutateAsync({
        id: appointmentToCancel.id,
      });

      setAppointmentToCancel(null);

      showToast("success", "Скасовано", "Запис видалено успішно");
    } catch (error: any) {
      console.error("Cancel error:", error);
      setAppointmentToCancel(null);

      showToast("error", "Помилка", "Упс. Щось пішло не так");
    }
  };

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Мої записи</Text>
          <Text style={styles.subtitle}>
            {pluralize(appointments?.length ?? 0, PLURAL.appointment)}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={{ flexGrow: 0, flexShrink: 0 }}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[styles.chip, activeFilter === f.key && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === f.key && styles.chipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Palette.taupe}
              colors={[Palette.taupe]}
            />
          }
        >
          {isLoading ? (
            <ActivityIndicator
              color={Palette.taupe}
              style={{ marginTop: 60 }}
            />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Calendar
                size={40}
                strokeWidth={1.2}
                color={Palette.taupe + "66"}
              />
              <Text style={styles.emptyText}>Записів не знайдено</Text>
            </View>
          ) : (
            <>
              <AppointmentSection
                title="Підтверджені"
                accent={Palette.sage}
                items={grouped.confirmed}
                onCancelPress={(item) => setAppointmentToCancel(item)}
              />
              <AppointmentSection
                title="Завершені"
                accent={Palette.taupe}
                items={grouped.completed}
                onBookAgain={handleBookAgain}
              />
              <AppointmentSection
                title="Скасовані"
                accent={Palette.rose}
                items={grouped.cancelled}
                onBookAgain={handleBookAgain}
              />
              <AppointmentSection
                title="Не з'явився"
                accent="#B8A9C9"
                items={grouped.noshow}
                onBookAgain={handleBookAgain}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <CancelConfirmModal
        visible={!!appointmentToCancel}
        appointment={{
          serviceName: appointmentToCancel?.serviceName ?? "",
          masterFirstName: appointmentToCancel?.masterFirstName ?? "",
          masterLastName: appointmentToCancel?.masterLastName ?? "",
        }}
        onCancel={confirmCancel}
        onClose={() => setAppointmentToCancel(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.ivory },
  header: { paddingHorizontal: 24, paddingTop: 16, marginBottom: 16 },
  title: {
    fontSize: 26,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    marginTop: 4,
    opacity: 0.75,
  },
  filters: { paddingHorizontal: 24, gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: Palette.sand,
    borderWidth: 1,
    borderColor: Palette.sandDark,
  },
  chipActive: { backgroundColor: Palette.taupe, borderColor: Palette.taupe },
  chipText: {
    fontSize: 12.5,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
  },
  chipTextActive: { fontFamily: "DMSans_500Medium", color: Palette.ivory },
  scroll: { paddingBottom: 32 },
  emptyBox: { alignItems: "center", marginTop: 80, gap: 14 },
  emptyText: {
    fontSize: 16,
    fontFamily: "CormorantGaramond_400Regular",
    fontStyle: "italic",
    color: Palette.taupe,
    opacity: 0.6,
  },
});
