import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Palette } from "@/src/theme/tokens";
import type { SlotResponse } from "@/src/api/generated/apiV1.schemas";

type Props = {
  slots: SlotResponse[] | undefined;
  loading: boolean;
  selectedSlot: SlotResponse | null;
  onSelectSlot: (slot: SlotResponse) => void;
  label: string;
  fmt: (iso: string) => string;
};

export function BookingSlots({
  slots,
  loading,
  selectedSlot,
  onSelectSlot,
  label,
  fmt,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>ЧАС · {label}</Text>

      {loading ? (
        <ActivityIndicator color={Palette.taupe} style={styles.loader} />
      ) : !slots || slots.length === 0 ? (
        <Text style={styles.emptySlots}>Немає вільних слотів</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.slotsRow}
        >
          {slots.map((slot, i) => {
            const selected = selectedSlot?.start === slot.start;
            return (
              <Pressable
                key={i}
                onPress={() => onSelectSlot(slot)}
                style={[styles.slotPill, selected && styles.slotPillActive]}
              >
                <Text
                  style={[styles.slotText, selected && styles.slotTextActive]}
                >
                  {fmt(slot.start as string)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 24, marginBottom: 16 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 1.2,
    color: Palette.taupe,
    opacity: 0.55,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  loader: { marginVertical: 12 },
  emptySlots: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.6,
    fontStyle: "italic",
  },
  slotsRow: { gap: 8, paddingRight: 8 },
  slotPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: Palette.sand,
  },
  slotPillActive: {
    backgroundColor: Palette.taupe,
    borderColor: Palette.taupe,
  },
  slotText: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
  },
  slotTextActive: { color: "#fff", fontFamily: "DMSans_500Medium" },
});
