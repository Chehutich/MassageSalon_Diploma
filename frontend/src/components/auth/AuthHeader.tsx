import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Palette } from "../../theme/tokens";
import { LeafLogo } from "../LeafLogo";

type Props = {
  title: string;
  subtitle: string;
};

export const AuthHeader = ({ title, subtitle }: Props) => (
  <View style={styles.header}>
    <View style={styles.logoRow}>
      <LeafLogo />
      <View>
        <Text style={styles.brandName}>SERENITY</Text>
        <Text style={styles.brandTagline}>Massage & Wellness</Text>
      </View>
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { marginBottom: 28 },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  brandName: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 2,
    color: Palette.taupe,
    opacity: 0.7,
  },
  brandTagline: {
    fontSize: 13,
    fontFamily: "CormorantGaramond_400Regular",
    color: Palette.taupe,
  },
  title: {
    fontSize: 32,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.taupe,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 13.5,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
    opacity: 0.6,
    marginTop: 8,
  },
});
