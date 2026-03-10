import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Palette } from "@/src/theme/tokens";

type Props = {
  text: string;
  linkText: string;
  onPress: () => void;
};

export const AuthFooter = ({ text, linkText, onPress }: Props) => (
  <View style={styles.footer}>
    <Text style={styles.text}>{text}</Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.link}>{linkText}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  text: {
    fontSize: 13.5,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
    opacity: 0.7,
  },
  link: {
    fontSize: 13.5,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    textDecorationLine: "underline",
  },
});
