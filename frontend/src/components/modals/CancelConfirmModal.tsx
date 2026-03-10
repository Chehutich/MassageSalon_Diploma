import { Palette } from "@/src/theme/tokens";
import { AlertCircle } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  appointment: {
    serviceName?: string;
    masterFirstName?: string;
    masterLastName?: string;
  };
  onCancel: () => void;
  onClose: () => void;
};

export function CancelConfirmModal({
  visible,
  appointment,
  onCancel,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop clickable area */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.indicator} />

        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <AlertCircle size={24} color={Palette.rose} strokeWidth={1.5} />
            </View>
            <Text style={styles.title}>Скасувати запис?</Text>
            <Text style={styles.description}>
              Ви впевнені, що хочете скасувати запис на{"\n"}
              <Text style={styles.highlight}>{appointment.serviceName}?</Text>
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Цю дію неможливо буде відмінити після підтвердження.
            </Text>
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.btnSecondary} onPress={onClose}>
              <Text style={styles.btnSecondaryText}>Залишити</Text>
            </Pressable>
            <Pressable style={styles.btnPrimary} onPress={onCancel}>
              <Text style={styles.btnPrimaryText}>Так, скасувати</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(28, 25, 23, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: Palette.ivory,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  indicator: {
    width: 36,
    height: 4,
    backgroundColor: Palette.sandDark,
    borderRadius: 2,
    position: "absolute",
    top: 12,
  },
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
  highlight: {
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
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
