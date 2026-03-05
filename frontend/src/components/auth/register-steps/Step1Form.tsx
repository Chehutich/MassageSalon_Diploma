import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { User, Mail, Phone, ChevronRight } from "lucide-react-native";
import { Palette } from "../../../theme/tokens";
import { InputField } from "../../InputField";
import { PersonalData, Step1Errors } from "../../../utils/validation";

type Props = {
  data: PersonalData;
  errors: Step1Errors;
  onChange: (field: keyof PersonalData, value: string) => void;
  onNext: () => void;
};

export const Step1Form = ({ data, errors, onChange, onNext }: Props) => (
  <View style={{ gap: 14 }}>
    <View style={{ flexDirection: "row", gap: 12 }}>
      <View style={{ flex: 1 }}>
        <InputField
          label="Ім'я"
          value={data.first}
          onChangeText={(v: string) => onChange("first", v)}
          isInvalid={!!errors.first}
          errorText={errors.first}
          icon={<User size={18} color={Palette.taupe} strokeWidth={1.6} />}
        />
      </View>
      <View style={{ flex: 1 }}>
        <InputField
          label="Прізвище"
          value={data.last}
          onChangeText={(v: string) => onChange("last", v)}
          isInvalid={!!errors.last}
          errorText={errors.last}
          icon={<User size={18} color={Palette.taupe} strokeWidth={1.6} />}
        />
      </View>
    </View>

    <InputField
      label="Номер телефону"
      value={data.phone}
      onChangeText={(v: string) => onChange("phone", v)}
      isInvalid={!!errors.phone}
      errorText={errors.phone}
      keyboardType="phone-pad"
      icon={<Phone size={18} color={Palette.taupe} strokeWidth={1.6} />}
    />

    <InputField
      label="Електронна пошта"
      value={data.email}
      onChangeText={(v: string) => onChange("email", v)}
      isInvalid={!!errors.email}
      errorText={errors.email}
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
