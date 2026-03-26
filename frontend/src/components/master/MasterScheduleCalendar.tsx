import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { BaseCalendar } from "@/src/components/ui/forms/BaseCalendar";
import { Palette } from "@/src/theme/tokens";
import { toDateString } from "@/src/utils/calendarHelpers";

type MasterScheduleProps = {
  viewYear: number;
  viewMonth: number;
  loading: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  workingDates: string[];
  offDates: string[];
  onDatePress?: (date: string) => void;
};

const CELL_SIZE = 34;

export function MasterScheduleCalendar(props: MasterScheduleProps) {
  const todayISO = toDateString(new Date());

  return (
    <BaseCalendar
      {...props}
      headerLabel="Мій робочий графік"
      renderCell={(day, i) => {
        if (!day)
          return <View key={`empty-${i}`} style={styles.cellContainer} />;

        const monthStr = String(props.viewMonth + 1).padStart(2, "0");
        const dayStr = String(day).padStart(2, "0");
        const dateISO = `${props.viewYear}-${monthStr}-${dayStr}`;

        const isTimeOff = props.offDates.includes(dateISO);
        const isWorking = props.workingDates.includes(dateISO);
        const isToday = dateISO === todayISO;

        return (
          <Pressable
            key={i}
            style={styles.cellContainer}
            onPress={() => props.onDatePress?.(dateISO)}
          >
            <View
              style={[
                styles.cellContent,
                isWorking && styles.workCell,
                isTimeOff && styles.offCell,
                isToday && styles.todayCell,
              ]}
            >
              <Text
                style={[
                  styles.cellText,
                  isWorking && styles.workText,
                  isToday && styles.todayText,
                  isTimeOff && styles.offText,
                ]}
              >
                {day}
              </Text>

              {isWorking && !isTimeOff && <View style={styles.workDot} />}
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  cellContainer: {
    width: `${100 / 7}%`,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  cellContent: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  cellText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
  },
  workCell: {
    backgroundColor: Palette.sage + "15",
    borderWidth: 1,
    borderColor: Palette.sage + "30",
    borderRadius: 10,
  },
  workText: {
    color: Palette.espresso,
    fontFamily: "DMSans_500Medium",
  },
  workDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Palette.sage,
    position: "absolute",
    bottom: 4,
  },
  offCell: {
    backgroundColor: Palette.taupe,
    borderRadius: 10,
    shadowColor: Palette.taupe,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  offText: {
    color: "#fff",
    fontFamily: "DMSans_700Bold",
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: Palette.espresso,
    borderRadius: 10,
  },
  todayText: {
    fontFamily: "DMSans_700Bold",
  },
});
