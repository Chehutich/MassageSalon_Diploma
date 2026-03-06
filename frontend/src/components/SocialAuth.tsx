import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Palette } from "../theme/tokens";

export const OrDivider = () => (
  <View style={styles.dividerContainer}>
    <View style={styles.line} />
    <Text style={styles.dividerText}>або</Text>
    <View style={styles.line} />
  </View>
);

export const SocialBtn = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
    <View style={styles.socialIcon}>{icon}</View>
    <Text style={styles.socialLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 14,
  },
  line: { flex: 1, height: 1, backgroundColor: Palette.taupe, opacity: 0.2 },
  dividerText: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.7,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  socialBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Palette.sand,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: Palette.sandDark,
  },
  socialIcon: { width: 20, alignItems: "center" },
  socialLabel: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
});
