import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Palette } from "@/src/theme/tokens";
import { LogOut } from "lucide-react-native";
import { BottomSheetModal } from "./BottomSheetModal";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function LogoutConfirmModal({ visible, onCancel, onConfirm }: Props) {
  return (
    <BottomSheetModal visible={visible} onClose={onCancel}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <LogOut size={24} color={Palette.rose} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Вихід з акаунту</Text>
        <Text style={styles.description}>
          Ви впевнені, що хочете вийти зі свого профілю?
        </Text>
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          Вам доведеться ввести свої дані знову, щоб увійти в додаток.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.btnSecondary} onPress={onCancel}>
          <Text style={styles.btnSecondaryText}>Скасувати</Text>
        </Pressable>
        <Pressable style={styles.btnPrimary} onPress={onConfirm}>
          <Text style={styles.btnPrimaryText}>Так, вийти</Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.rose + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    textAlign: "center",
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: Palette.sand + "50",
    padding: 14,
    borderRadius: 16,
    marginBottom: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: Palette.sandDark + "30",
  },
  warningText: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    textAlign: "center",
    opacity: 0.8,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  btnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Palette.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
  },
  btnPrimary: {
    flex: 1.4,
    height: 48,
    borderRadius: 14,
    backgroundColor: Palette.espresso,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.ivory,
  },
});
