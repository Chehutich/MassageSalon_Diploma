import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import * as bookingHelpers from "./booking.helpers";
import { Palette } from "@/src/theme/tokens";

type Props = {
  viewYear: number;
  viewMonth: number;
  selectedDate: Date | null;
  availableDates: string[] | undefined;
  loading: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (day: number) => void;
  isDateDisabled: (day: number) => boolean;
  isSelected: (day: number) => boolean;
};

const SELECTED_CIRCLE_SIZE = 32;

export function BookingCalendar({
  viewYear,
  viewMonth,
  selectedDate,
  availableDates,
  loading,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  isDateDisabled,
  isSelected,
}: Props) {
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1,
  );

  const today = new Date();
  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>Оберіть дату</Text>
        {loading && <ActivityIndicator size="small" color={Palette.taupe} />}
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.calNav}>
          <Pressable
            onPress={onPrevMonth}
            style={[styles.calNavBtn, isCurrentMonth && { opacity: 0.3 }]}
            hitSlop={8}
            disabled={isCurrentMonth}
          >
            <ChevronLeft size={16} strokeWidth={1.8} color={Palette.taupe} />
          </Pressable>
          <Text style={styles.calMonthLabel}>
            {bookingHelpers.MONTHS_UA_SHORT[viewMonth]} {viewYear}
          </Text>
          <Pressable onPress={onNextMonth} style={styles.calNavBtn} hitSlop={8}>
            <ChevronRight size={16} strokeWidth={1.8} color={Palette.taupe} />
          </Pressable>
        </View>

        <View style={styles.calGrid}>
          {bookingHelpers.DAYS_OF_WEEK.map((d) => (
            <Text key={d} style={styles.calDayHeader}>
              {d}
            </Text>
          ))}
          {cells.map((day, i) => {
            const disabled = !day || isDateDisabled(day);
            const selected = day ? isSelected(day) : false;
            const isAvailable = day && !isDateDisabled(day);

            return (
              <Pressable
                key={i}
                disabled={disabled}
                onPress={() => day && onSelectDate(day)}
                style={[styles.calCell, disabled && { opacity: 0.25 }]}
              >
                {day ? (
                  <View
                    style={[
                      styles.cellContent,
                      selected && styles.cellContentSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calCellText,
                        selected && styles.calCellTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                    {isAvailable && !selected && (
                      <View style={styles.availDot} />
                    )}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 24, marginBottom: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 1.2,
    color: Palette.taupe,
    opacity: 0.55,
    textTransform: "uppercase",
  },
  calendarCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.sand,
  },
  calNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  calNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: Palette.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  calMonthLabel: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calDayHeader: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 10,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    opacity: 0.5,
    paddingBottom: 8,
  },
  calCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  cellContent: {
    alignItems: "center",
    justifyContent: "center",
    width: SELECTED_CIRCLE_SIZE,
    height: SELECTED_CIRCLE_SIZE,
  },
  cellContentSelected: {
    backgroundColor: Palette.taupe,
    borderRadius: SELECTED_CIRCLE_SIZE / 2,
  },
  calCellText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
  },
  calCellTextSelected: { color: "#fff", fontFamily: "DMSans_500Medium" },
  availDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.taupe,
    position: "absolute",
    bottom: 2,
  },
});
