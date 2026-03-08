import React from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Palette } from "@/src/theme/tokens";
import { MasterAvatar } from "@/src/components/MasterAvatar";
import { CircleUserRound } from "lucide-react-native";
import type {
  MasterResponse,
  SlotResponse,
} from "@/src/api/generated/apiV1.schemas";

type Props = {
  service: any;
  selectedDate: Date | null;
  selectedSlot: SlotResponse | null;
  selectedMaster: MasterResponse | null;
  notes: string;
  onNotesChange: (text: string) => void;
  onBook: () => void;
  isPending: boolean;
  dateLabel: string;
  fmt: (iso: string) => string;
};

export function BookingSummary({
  service,
  selectedDate,
  selectedSlot,
  selectedMaster,
  notes,
  onNotesChange,
  onBook,
  isPending,
  dateLabel,
  fmt,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Деталі запису</Text>
      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Послуга</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailVal}>{service?.title || "—"}</Text>
            <Text style={styles.detailSub}>
              {service?.duration ? `${service.duration} хв` : "—"}
            </Text>
          </View>
          <Text style={styles.detailPrice}>
            {service?.price ? `${service.price} ₴` : "—"}
          </Text>
        </View>

        <View style={styles.detailDivider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Дата</Text>
          <Text style={styles.detailVal}>{selectedDate ? dateLabel : "—"}</Text>
          <Text style={styles.detailTime}>
            {selectedSlot
              ? `${fmt(selectedSlot.start as string)} – ${fmt(selectedSlot.end as string)}`
              : "—"}
          </Text>
        </View>

        <View style={styles.detailDivider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Майстер</Text>
          <View style={styles.detailMasterRow}>
            {selectedMaster ? (
              <MasterAvatar
                firstName={selectedMaster.firstName}
                lastName={selectedMaster.lastName}
                photoUrl={selectedMaster.photoUrl ?? null}
                size={28}
                accent={Palette.taupe}
              />
            ) : (
              <CircleUserRound size={28} color={Palette.taupe} />
            )}
            <Text style={styles.detailVal}>
              {selectedMaster
                ? `${selectedMaster.firstName} ${selectedMaster.lastName}`
                : "Перший доступний"}
            </Text>
          </View>
        </View>
      </View>

      <TextInput
        value={notes}
        onChangeText={onNotesChange}
        placeholder="Побажання, нотатки…"
        placeholderTextColor={Palette.taupe + "66"}
        style={styles.notesInput}
        multiline
      />

      <View style={styles.ctaWrap}>
        <Pressable
          onPress={onBook}
          disabled={isPending || !selectedSlot}
          style={[styles.ctaBtn, !selectedSlot && { opacity: 0.5 }]}
        >
          {isPending ? (
            <ActivityIndicator color={Palette.espresso} />
          ) : (
            <Text style={styles.ctaBtnText}>
              Підтвердити запис · {service?.price ? `${service.price} ₴` : "—"}
            </Text>
          )}
        </Pressable>
        <Text style={styles.ctaSub}>Безкоштовне скасування за 24 год</Text>
      </View>
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
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.sand,
    gap: 10,
    marginBottom: 12,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailKey: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.6,
    width: 56,
  },
  detailVal: {
    flex: 1,
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  detailSub: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.6,
  },
  detailPrice: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  detailTime: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
  },
  detailDivider: { height: 1, backgroundColor: Palette.sand },
  detailMasterRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  anyMasterIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.sandDark,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.sand,
  },
  notesInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.sand,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
    minHeight: 70,
    textAlignVertical: "top",
  },
  ctaWrap: { marginTop: 24, gap: 10 },
  ctaBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Palette.rose,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaBtnText: {
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  ctaSub: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.55,
    textAlign: "center",
  },
});
