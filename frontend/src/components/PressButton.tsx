import React from "react";
import { Pressable, Text, StyleSheet, Animated } from "react-native";
import { Palette, Shadows } from "../theme/tokens";

export const PressButton = ({ title, onPress, loading }: any) => {
  const scale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          { opacity: pressed ? 0.9 : 1 },
          Shadows.button,
        ]}
      >
        <Text style={styles.text}>{loading ? "Connecting..." : title}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 58,
    backgroundColor: Palette.rose,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: Palette.espresso,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "DMSans_500Medium",
  },
});
