import React, { useRef } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
} from "react-native";
import { Palette, Shadows } from "../theme/tokens";

export const PressButton = ({ title, onPress, loading, disabled }: any) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (loading || disabled) return;
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    if (loading || disabled) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={loading || disabled}
        style={({ pressed }) => [
          styles.button,
          { opacity: pressed || loading || disabled ? 0.8 : 1 },
          Shadows.button,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Palette.espresso} size="small" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
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
    flexDirection: "row",
  },
  text: {
    color: Palette.espresso,
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
  },
});
