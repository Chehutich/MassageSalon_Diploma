import React from "react";
import { View, StyleSheet } from "react-native";
import { Palette } from "../theme/tokens";
import Svg, { Circle } from "react-native-svg";

export const AmbientBackground = () => (
  <View style={StyleSheet.absoluteFill}>
    {/* Rose Blob */}
    <View
      style={[
        styles.blob,
        { top: -100, right: -80, backgroundColor: Palette.rose + "26" },
      ]}
    />

    {/* Decorative Arcs */}
    <Svg style={styles.arcsTop} width="220" height="220" viewBox="0 0 220 220">
      <Circle
        cx="180"
        cy="40"
        r="90"
        fill="none"
        stroke={Palette.taupe}
        strokeWidth="0.8"
        opacity="0.18"
      />
      <Circle
        cx="180"
        cy="40"
        r="65"
        fill="none"
        stroke={Palette.taupe}
        strokeWidth="0.5"
        opacity="0.18"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 200,
  },
  arcsTop: {
    position: "absolute",
    top: 0,
    right: 0,
  },
});
