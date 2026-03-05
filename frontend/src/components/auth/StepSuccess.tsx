import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { Palette } from "../../theme/tokens";

export const StepSuccess = ({ name }: { name: string }) => (
  <View style={{ alignItems: "center", gap: 20, paddingVertical: 20 }}>
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

    <View style={{ alignItems: "center", gap: 8 }}>
      <Text
        style={{
          fontSize: 30,
          fontFamily: "CormorantGaramond_600SemiBold",
          color: Palette.taupe,
          textAlign: "center",
          lineHeight: 36,
        }}
      >
        {"Ласкаво просимо,\n" + (name || "друже") + "."}
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontFamily: "DMSans_400Regular",
          color: Palette.espresso,
          opacity: 0.65,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        {"Ваш акаунт готовий.\nЧас записатись на перший сеанс."}
      </Text>
    </View>

    <View style={{ flexDirection: "row", gap: 10, opacity: 0.5 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === 1 ? Palette.rose : Palette.sage,
          }}
        />
      ))}
    </View>

    <TouchableOpacity activeOpacity={0.85} style={styles.btn}>
      <Text style={styles.btnText}>Записатись на сеанс →</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    height: 58,
    borderRadius: 16,
    backgroundColor: Palette.rose,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Palette.rose,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  btnText: {
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
    letterSpacing: 0.6,
  },
});
