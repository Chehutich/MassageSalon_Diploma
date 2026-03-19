import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import * as bookingHelpers from "@/src/utils/calendarHelpers";
import { Palette } from "@/src/theme/tokens";

export type BaseCalendarProps = {
  viewYear: number;
  viewMonth: number;
  loading?: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  renderCell: (day: number | null, index: number) => React.ReactNode;
  headerLabel?: string;
};

export function BaseCalendar({
  viewYear,
  viewMonth,
  loading,
  onPrevMonth,
  onNextMonth,
  renderCell,
  headerLabel,
}: BaseCalendarProps) {
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const shift = (firstDay + 6) % 7;

  const cells = Array.from({ length: shift + daysInMonth }, (_, i) =>
    i < shift ? null : i - shift + 1,
  );

  const today = new Date();
  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>{headerLabel}</Text>
        {loading && <ActivityIndicator size="small" color={Palette.taupe} />}
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.calNav}>
          <Pressable
            onPress={onPrevMonth}
            style={[styles.calNavBtn, isCurrentMonth && { opacity: 0.3 }]}
            disabled={isCurrentMonth}
          >
            <ChevronLeft size={16} strokeWidth={1.8} color={Palette.taupe} />
          </Pressable>
          <Text style={styles.calMonthLabel}>
            {bookingHelpers.MONTHS_UA_SHORT[viewMonth]} {viewYear}
          </Text>
          <Pressable onPress={onNextMonth} style={styles.calNavBtn}>
            <ChevronRight size={16} strokeWidth={1.8} color={Palette.taupe} />
          </Pressable>
        </View>

        <View style={styles.calGrid}>
          {bookingHelpers.DAYS_OF_WEEK.map((d) => (
            <Text key={d} style={styles.calDayHeader}>
              {d}
            </Text>
          ))}
          {cells.map((day, i) => renderCell(day, i))}
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
});
