import React from "react";
import { View, Text } from "react-native";
import { Palette } from "../theme/tokens";

export const LoadingSpinner = ({ label }: { label: string }) => (
  <View
    style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 18 }}
  >
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: Palette.sandDark ?? "#D9C4AB",
        borderTopColor: Palette.rose,
      }}
    />
    <Text
      style={{
        fontSize: 14,
        fontFamily: "CormorantGaramond_400Regular",
        fontStyle: "italic",
        color: Palette.taupe,
        opacity: 0.7,
      }}
    >
      {label}
    </Text>
  </View>
);
