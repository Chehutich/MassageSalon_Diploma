import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { DAYS_OF_WEEK, MONTHS_UA_FULL } from "@/src/utils/calendarHelpers";
import type { SlotResponse } from "@/src/api/generated/apiV1.schemas";

type Props = {
  date: Date | null;
  slot: SlotResponse | null;
  onClose: () => void;
  fmt: (iso: string) => string;
};

export function BookingSuccess({ date, slot, onClose, fmt }: Props) {
  return (
    <View style={styles.successWrap}>
      <View style={styles.successCircle}>
        <Check size={36} strokeWidth={2} color="#fff" />
      </View>
      <Text style={styles.successTitle}>Заброньовано!</Text>
      <Text style={styles.successSub}>Чекаємо вас</Text>

      {date && slot && (
        <View style={styles.successPill}>
          <Text style={styles.successPillText}>
            {DAYS_OF_WEEK[date.getDay()]}, {date.getDate()}{" "}
            {MONTHS_UA_FULL[date.getMonth()]} · {fmt(slot.start as string)}
          </Text>
        </View>
      )}

      <Pressable onPress={onClose} style={styles.successBtn}>
        <Text style={styles.successBtnText}>Чудово</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  successWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.sage,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 30,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
  },
  successSub: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.7,
  },
  successPill: {
    backgroundColor: Palette.sand,
    borderRadius: 99,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 8,
  },
  successPillText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  successBtn: {
    marginTop: 16,
    height: 52,
    width: "100%",
    borderRadius: 14,
    backgroundColor: Palette.rose,
    alignItems: "center",
    justifyContent: "center",
  },
  successBtnText: {
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
});
