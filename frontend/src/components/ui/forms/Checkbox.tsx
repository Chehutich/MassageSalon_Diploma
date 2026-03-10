import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";

type Props = { checked: boolean; onToggle: () => void; label: string };

export const Checkbox = ({ checked, onToggle, label }: Props) => (
  <TouchableOpacity
    onPress={onToggle}
    activeOpacity={0.7}
    style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
  >
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 6,
        marginTop: 1,
        backgroundColor: checked ? Palette.sage : Palette.sand,
        borderWidth: 1.5,
        borderColor: checked ? Palette.sage : (Palette.sandDark ?? "#D9C4AB"),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {checked && <Check size={12} strokeWidth={2.5} color="#fff" />}
    </View>
    <Text
      style={{
        flex: 1,
        fontSize: 13,
        fontFamily: "DMSans_400Regular",
        color: Palette.espresso,
        lineHeight: 20,
        opacity: 0.8,
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);
