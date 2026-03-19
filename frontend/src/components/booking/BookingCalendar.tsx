import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { BaseCalendar } from "@/src/components/ui/forms/BaseCalendar";
import { Palette } from "@/src/theme/tokens";

type BookingProps = {
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

export function BookingCalendar(props: BookingProps) {
  return (
    <BaseCalendar
      {...props}
      headerLabel="Оберіть дату"
      renderCell={(day, i) => {
        if (!day) return <View key={`empty-${i}`} style={styles.calCell} />;

        const disabled = props.isDateDisabled(day);
        const selected = props.isSelected(day);
        const isAvailable = !disabled;

        return (
          <Pressable
            key={i}
            disabled={disabled}
            onPress={() => props.onSelectDate(day)}
            style={[styles.calCell, disabled && { opacity: 0.25 }]}
          >
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
              {isAvailable && !selected && <View style={styles.availDot} />}
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
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
