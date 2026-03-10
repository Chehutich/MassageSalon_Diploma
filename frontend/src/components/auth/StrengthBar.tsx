import React from "react";
import { View, Text } from "react-native";
import { Palette } from "@/src/theme/tokens";

const getStrength = (pw: string) => {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "Занадто короткий", color: Palette.rose },
    { label: "Слабкий", color: "#E8A87C" },
    { label: "Середній", color: "#D4C068" },
    { label: "Хороший", color: Palette.sage },
    { label: "Надійний", color: "#7BAE7F" },
  ];
  return { score: s, ...map[s] };
};

export const StrengthBar = ({ password }: { password: string }) => {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: "row", gap: 5, marginBottom: 5 }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 99,
              backgroundColor: i <= score ? color : Palette.taupe + "22",
            }}
          />
        ))}
      </View>
      <Text
        style={{
          fontSize: 11.5,
          fontFamily: "DMSans_500Medium",
          color,
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Text>
    </View>
  );
};
