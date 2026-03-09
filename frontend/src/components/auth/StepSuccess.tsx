import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check, ArrowRight } from "lucide-react-native";
import { Palette } from "../../theme/tokens";

type Props = {
  name: string;
  onLogin: () => void;
};

export const StepSuccess = ({ name, onLogin }: Props) => (
  <View style={{ alignItems: "center", gap: 24, paddingVertical: 20 }}>
    <View
      style={{
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Palette.sage + "33",
        borderWidth: 2,
        borderColor: Palette.sage + "55",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Check size={38} strokeWidth={1.8} color={Palette.sage} />
    </View>

    <View style={{ alignItems: "center", gap: 10 }}>
      <Text
        style={{
          fontSize: 28,
          fontFamily: "CormorantGaramond_600SemiBold",
          color: Palette.taupe,
          textAlign: "center",
          lineHeight: 34,
        }}
      >
        {`Чудово, ${name || "друже"}.\nАкаунт створено.`}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontFamily: "DMSans_400Regular",
          color: Palette.espresso,
          opacity: 0.6,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        {"Тепер ви можете увійти та\nкористуватися всіма перевагами."}
      </Text>
    </View>

    <View style={{ flexDirection: "row", gap: 8, opacity: 0.4 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: i === 2 ? Palette.rose : Palette.taupe,
          }}
        />
      ))}
    </View>

    <TouchableOpacity activeOpacity={0.8} style={styles.btn} onPress={onLogin}>
      <View style={styles.btnContent}>
        <Text style={styles.btnText}>Увійти до системи</Text>
        <ArrowRight size={18} color={Palette.espresso} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    height: 58,
    borderRadius: 18,
    backgroundColor: Palette.rose,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Palette.rose,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 10,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  btnText: {
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
    letterSpacing: 0.4,
  },
});
