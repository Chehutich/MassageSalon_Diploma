import {
  BottomSheet,
  useBottomSheetScroll,
} from "@/src/components/ui/layout/BottomSheet";
import { Palette } from "@/src/theme/tokens";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { BookingCalendar } from "./BookingCalendar";
import { BookingMasters } from "./BookingMasters";
import { BookingSlots } from "./BookingSlots";
import { BookingSummary } from "./BookingSummary";
import type {
  MasterResponse,
  SlotResponse,
} from "@/src/api/generated/apiV1.schemas";
import {
  getGetMyAppointmentsQueryKey,
  useCreateAppointment,
  useGetAvailableDates,
  useGetAvailableSlots,
} from "@/src/api/generated/appointments/appointments";
import { useGetMasters } from "@/src/api/generated/masters/masters";
import { useGetServiceById } from "@/src/api/generated/services/services";
import { useQueryClient } from "@tanstack/react-query";

// Helpers
import {
  DAYS_OF_WEEK,
  fmtTime,
  MONTHS_UA_FULL,
  toDateString,
} from "./booking.helpers";

type Props = {
  serviceId: string | null;
  masterId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (errMessage: string) => void;
};

export function BookingSheet({
  serviceId,
  masterId: initMasterId,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const { scrollEnabled, isAtTopRef } = useBottomSheetScroll();
  const queryClient = useQueryClient();

  const today = new Date();
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(
    initMasterId ?? null,
  );
  const [selectedMaster, setSelectedMaster] = useState<MasterResponse | null>(
    null,
  );
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotResponse | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!serviceId) {
      setSelectedDate(null);
      setSelectedSlot(null);
      setNotes("");
    }
  }, [serviceId]);

  const queryOptions = {
    enabled: !!serviceId,
    staleTime: 10 * 1000,
    gcTime: 15 * 1000,
    refetchOnWindowFocus: true,
  };

  // API Requests
  const { data: service } = useGetServiceById(serviceId ?? "", {
    query: queryOptions,
  });

  const { data: masters, isLoading: mastersLoading } = useGetMasters(
    { ServiceId: serviceId ?? "" },
    { query: queryOptions },
  );

  const { data: slots, isLoading: slotsLoading } = useGetAvailableSlots(
    {
      ServiceId: serviceId ?? "",
      MasterId: selectedMasterId ?? undefined,
      Date: selectedDate ? toDateString(selectedDate) : "",
    },
    {
      query: {
        ...queryOptions,
        enabled: !!selectedDate && !!serviceId,
      },
    },
  );

  const { data: availableDates, isLoading: datesLoading } =
    useGetAvailableDates(
      {
        ServiceId: serviceId ?? "",
        MasterId: selectedMasterId ?? undefined,
        Year: viewYear,
        Month: viewMonth + 1,
      },
      { query: queryOptions },
    );

  const { mutate: createAppointment, isPending } = useCreateAppointment();

  // Calendar Logic
  const checkDateDisabled = (day: number): boolean => {
    if (!day) return true;
    const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);

    const past = d < t;
    const notAvailable = availableDates
      ? !availableDates.includes(dateKey)
      : true;

    return past || notAvailable;
  };

  const isDateSelected = (day: number) =>
    !!(
      selectedDate?.getDate() === day &&
      selectedDate?.getMonth() === viewMonth &&
      selectedDate?.getFullYear() === viewYear
    );

  // Handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const handleSelectDate = (day: number) => {
    if (checkDateDisabled(day)) return;
    setSelectedDate(new Date(viewYear, viewMonth, day));
    setSelectedSlot(null);
  };

  useEffect(() => {
    if (selectedDate && availableDates) {
      if (!availableDates.includes(toDateString(selectedDate))) {
        setSelectedDate(null);
        setSelectedSlot(null);
      }
    }
  }, [availableDates]);

  const handleBook = () => {
    if (!selectedSlot) return;
    createAppointment(
      {
        data: {
          serviceId: serviceId!,
          masterId: selectedMasterId ?? null,
          startTime: selectedSlot.start as string,
          notes: notes || null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetMyAppointmentsQueryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: ["/api/appointments/available-dates"],
          });
          queryClient.invalidateQueries({
            queryKey: ["/api/appointments/available-slots"],
          });
          onSuccess?.();
        },
        onError: (error: any) => {
          onError?.("Упс. Не вдалося створити запис. Щось пішло не так.");
        },
      },
    );
  };

  const slotDateLabel = selectedDate
    ? `${DAYS_OF_WEEK[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTHS_UA_FULL[selectedDate.getMonth()]}`
    : "";

  return (
    <BottomSheet
      visible={!!serviceId}
      onClose={onClose}
      maxHeight="92%"
      title={service?.title}
      subtitle={
        service ? `${service.duration} хв · ${service.price} ₴` : undefined
      }
    >
      <ScrollView
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={(e) => {
          isAtTopRef.current = e.nativeEvent.contentOffset.y <= 0;
        }}
      >
        {/* 2. Masters */}
        <BookingMasters
          masters={masters}
          loading={mastersLoading}
          selectedMasterId={selectedMasterId}
          selectedMaster={selectedMaster}
          onSelectMaster={(m) => {
            setSelectedMasterId(m?.id ?? null);
            setSelectedMaster(m);
            setSelectedSlot(null);
          }}
        />
        <View style={styles.divider} />

        {/* 3. Calendar */}
        <BookingCalendar
          viewYear={viewYear}
          viewMonth={viewMonth}
          selectedDate={selectedDate}
          availableDates={availableDates}
          loading={datesLoading}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectDate={handleSelectDate}
          isDateDisabled={checkDateDisabled}
          isSelected={isDateSelected}
        />

        {/* 4. Slots */}
        {selectedDate && (
          <>
            <View style={styles.divider} />
            <BookingSlots
              slots={slots}
              loading={slotsLoading}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              label={slotDateLabel}
              fmt={fmtTime}
            />
          </>
        )}

        <View style={styles.divider} />

        {/* 5. Summary */}
        <BookingSummary
          service={service}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          selectedMaster={selectedMaster}
          notes={notes}
          onNotesChange={setNotes}
          onBook={handleBook}
          isPending={isPending}
          dateLabel={slotDateLabel}
          fmt={fmtTime}
        />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  divider: { height: 1, backgroundColor: Palette.sand, marginBottom: 16 },
});
