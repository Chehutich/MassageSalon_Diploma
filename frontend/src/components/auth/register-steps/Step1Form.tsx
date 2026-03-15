import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { User, Mail, Phone, ChevronRight } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { RHFInputField } from "@/src/components/ui/forms/RHFInputField";

import { RHFPhoneInputField } from "@/src/components/ui/forms/RHFPhoneInputField";

export const Step1Form = ({ control, onNext }: any) => (
  <View style={{ gap: 14 }}>
    <View style={{ flexDirection: "row", gap: 12 }}>
      <View style={{ flex: 1 }}>
        <RHFInputField
          name="first"
          control={control}
          label="Ім'я"
          icon={<User size={18} color={Palette.taupe} strokeWidth={1.6} />}
        />
      </View>
      <View style={{ flex: 1 }}>
        <RHFInputField
          name="last"
          control={control}
          label="Прізвище"
          icon={<User size={18} color={Palette.taupe} strokeWidth={1.6} />}
        />
      </View>
    </View>

    <RHFPhoneInputField
      name="phone"
      control={control}
      label="Номер телефону"
    />

    <RHFInputField
      name="email"
      control={control}
      label="Електронна пошта"
      keyboardType="email-address"
      autoCapitalize="none"
      icon={<Mail size={18} color={Palette.taupe} strokeWidth={1.6} />}
    />

    <TouchableOpacity onPress={onNext} activeOpacity={0.85} style={styles.btn}>
      <Text style={styles.btnText}>Продовжити</Text>
      <ChevronRight size={18} strokeWidth={2} color={Palette.espresso} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  btn: {
    height: 58,
    borderRadius: 16,
    backgroundColor: Palette.rose,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Palette.rose,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
    marginTop: 6,
  },
  btnText: {
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
    letterSpacing: 0.6,
  },
});
