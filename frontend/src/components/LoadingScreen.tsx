import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Palette } from "../theme/tokens";
import { LeafLogo } from "./LeafLogo";

export const LoadingScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseDot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ).start();

    pulseDot(dotAnim1, 0);
    pulseDot(dotAnim2, 160);
    pulseDot(dotAnim3, 320);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LeafLogo />

        <View style={{ marginTop: 16, alignItems: "center" }}>
          <Text style={styles.brandName}>SERENITY</Text>
          <Text style={styles.brandTagline}>Massage & Wellness</Text>
        </View>

        <View style={styles.dotsRow}>
          {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: anim,
                  backgroundColor: i === 1 ? Palette.rose : Palette.sage,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.ivory,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  brandName: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 4,
    color: Palette.taupe,
    opacity: 0.8,
  },
  brandTagline: {
    fontSize: 14,
    fontFamily: "CormorantGaramond_400Regular",
    color: Palette.taupe,
    opacity: 0.65,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 40,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
