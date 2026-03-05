import React from "react";
import { View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { Palette } from "../../theme/tokens";

type Props = { active: boolean; done: boolean; num: number };

export const StepDot = ({ active, done, num }: Props) => (
  <View
    style={{
      width: done ? 24 : active ? 28 : 20,
      height: done ? 24 : active ? 28 : 20,
      borderRadius: 99,
      backgroundColor: done
        ? Palette.sage
        : active
          ? Palette.rose
          : Palette.taupe + "22",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {done ? (
      <Check size={13} strokeWidth={2.5} color="#fff" />
    ) : (
      <Text
        style={{
          fontSize: active ? 12 : 10,
          fontFamily: "DMSans_500Medium",
          color: active ? Palette.espresso : Palette.taupe + "88",
        }}
      >
        {num}
      </Text>
    )}
  </View>
);
