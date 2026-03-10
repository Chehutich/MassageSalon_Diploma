import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Palette } from "@/src/theme/tokens";
import { Camera, Image as ImageIcon, Trash2 } from "lucide-react-native";
import { BottomSheetModal } from "./BottomSheetModal";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
  onRemove?: () => void;
  hasImage?: boolean;
};

export function ImagePickerModal({
  visible,
  onClose,
  onSelectCamera,
  onSelectLibrary,
  onRemove,
  hasImage,
}: Props) {
  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={styles.title}>Фото профілю</Text>
        <Text style={styles.description}>
          Оберіть зручний спосіб, щоб оновити ваше зображення
        </Text>
      </View>

      <View style={styles.optionsGrid}>
        <Pressable
          style={styles.optionBtn}
          onPress={() => {
            onSelectCamera();
            onClose();
          }}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: Palette.sage + "15" },
            ]}
          >
            <Camera size={24} color={Palette.sage} strokeWidth={1.5} />
          </View>
          <Text style={styles.optionLabel}>Камера</Text>
        </Pressable>

        <Pressable
          style={styles.optionBtn}
          onPress={() => {
            onSelectLibrary();
            onClose();
          }}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: Palette.taupe + "15" },
            ]}
          >
            <ImageIcon size={24} color={Palette.taupe} strokeWidth={1.5} />
          </View>
          <Text style={styles.optionLabel}>Галерея</Text>
        </Pressable>
      </View>

      {hasImage && onRemove && (
        <Pressable
          style={styles.removeBtn}
          onPress={() => {
            onRemove();
            onClose();
          }}
        >
          <Trash2 size={18} color={Palette.rose} strokeWidth={1.5} />
          <Text style={styles.removeBtnText}>Видалити поточне фото</Text>
        </Pressable>
      )}

      <View style={styles.footer}>
        <Pressable style={styles.btnCancel} onPress={onClose}>
          <Text style={styles.btnCancelText}>Скасувати</Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
  },
  optionsGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
    width: "100%",
  },
  optionBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Palette.sand,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    padding: 12,
  },
  removeBtnText: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.rose,
  },
  footer: {
    width: "100%",
  },
  btnCancel: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Palette.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancelText: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
  },
});
