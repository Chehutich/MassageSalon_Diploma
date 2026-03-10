import React from "react";
import { View } from "react-native";
import { Palette } from "@/src/theme/tokens";

export const StepLine = ({ done }: { done: boolean }) => (
  <View
    style={{
      flex: 1,
      height: 1.5,
      borderRadius: 99,
      backgroundColor: done ? Palette.sage : Palette.taupe + "20",
    }}
  />
);
