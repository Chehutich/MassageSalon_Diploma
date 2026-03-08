import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Check, UserRound } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { MasterAvatar } from "@/src/components/MasterAvatar";
import type { MasterResponse } from "@/src/api/generated/apiV1.schemas";

type Props = {
  masters: MasterResponse[] | undefined;
  loading: boolean;
  selectedMasterId: string | null;
  selectedMaster: MasterResponse | null;
  onSelectMaster: (master: MasterResponse | null) => void;
};

export function BookingMasters(props: Props) {
  const { masters, loading, selectedMasterId, selectedMaster, onSelectMaster } =
    props;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Оберіть майстра</Text>

      {loading ? (
        <ActivityIndicator color={Palette.taupe} style={styles.loader} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.mastersScrollContent}
        >
          {/* Any master */}
          <Pressable
            style={styles.masterItem}
            onPress={() => onSelectMaster(null)}
          >
            <View
              style={[
                styles.masterAvatar,
                selectedMasterId === null && styles.masterAvatarActive,
              ]}
            >
              <UserRound size={24} color={Palette.taupe} />
            </View>
            <Text
              style={[
                styles.masterName,
                selectedMasterId === null && styles.masterNameActive,
              ]}
            >
              Будь-який
            </Text>
          </Pressable>

          {masters?.map((m) => {
            const isSelected = selectedMasterId === m.id;
            return (
              <Pressable
                key={m.id}
                style={styles.masterItem}
                onPress={() => onSelectMaster(m)}
              >
                <View
                  style={[
                    styles.masterAvatarWrap,
                    isSelected && styles.masterAvatarWrapActive,
                  ]}
                >
                  <MasterAvatar
                    firstName={m.firstName}
                    lastName={m.lastName}
                    photoUrl={m.photoUrl}
                    size={52}
                    accent={Palette.taupe}
                  />
                  {isSelected && (
                    <View style={styles.masterCheck}>
                      <Check size={10} strokeWidth={3} color="#fff" />
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.masterName,
                    isSelected && styles.masterNameActive,
                  ]}
                >
                  {m.firstName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.selectedMasterWrapper}>
        <View style={styles.selectedMasterRow}>
          <View style={styles.selectedMasterDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedMasterText}>
              {selectedMaster
                ? `${selectedMaster.firstName} ${selectedMaster.lastName}`
                : "Будь-який майстер"}
            </Text>
            <Text style={styles.selectedMasterSub}>
              {selectedMaster ? "Обраний майстер" : "Перший доступний"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 1.2,
    color: Palette.taupe,
    opacity: 0.55,
    textTransform: "uppercase",
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  loader: { marginVertical: 16 },
  mastersScrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  mastersRow: { gap: 16, paddingRight: 8 },
  masterItem: { alignItems: "center", gap: 6, width: 60 },
  masterAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.sand,
  },
  masterAvatarActive: { borderColor: Palette.sage, borderStyle: "solid" },
  anyMasterIcon: { fontSize: 18 },
  masterAvatarWrap: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "transparent",
  },
  masterAvatarWrapActive: { borderColor: Palette.sage },
  masterCheck: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Palette.sage,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  masterName: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    textAlign: "center",
  },
  masterNameActive: {
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  selectedMasterWrapper: {
    paddingHorizontal: 24,
  },
  selectedMasterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    backgroundColor: Palette.sand + "60",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingLeft: 24,
  },
  selectedMasterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.taupe,
    opacity: 0.5,
  },
  selectedMasterText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  selectedMasterSub: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.65,
  },
});
