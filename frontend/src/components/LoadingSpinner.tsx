// src/components/LoadingSpinner.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { Palette } from "../theme/tokens";

export const LoadingSpinner = ({ label }: { label?: string }) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    rotation.setValue(0);

    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
      }}
    >
      <Animated.View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: Palette.sandDark ?? "#D9C4AB",
          borderTopColor: Palette.rose,
          transform: [{ rotate }],
        }}
      />
      {label && (
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
      )}
    </View>
  );
};
