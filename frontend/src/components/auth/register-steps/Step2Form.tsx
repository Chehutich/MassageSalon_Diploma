import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useWatch } from "react-hook-form";
import { Palette } from "@/src/theme/tokens";
import { RHFCheckbox } from "@/src/components/ui/forms/RHFCheckbox";
import { RHFPasswordField } from "@/src/components/ui/forms/RHFPasswordField";
import { StrengthBar } from "@/src/components/auth/StrengthBar";

export const Step2Form = ({ control, onNext, onBack, errors }: any) => {
  const password = useWatch({ control, name: "password" });

  return (
    <View style={{ gap: 14 }}>
      <RHFPasswordField
        name="password"
        control={control}
        label="Пароль"
      />

      <StrengthBar password={password || ""} />

      <RHFPasswordField
        name="confirm"
        control={control}
        label="Підтвердження паролю"
      />

      <RHFCheckbox
        name="terms"
        control={control}
        label="Я погоджуюсь з Умовами використання та Політикою конфіденційності"
      />
      {errors?.terms && <Text style={styles.termsError}>{errors.terms.message as string}</Text>}

      <TouchableOpacity onPress={onNext} activeOpacity={0.85} style={styles.btn}>
        <Text style={styles.btnText}>Створити акаунт</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>← Назад</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
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
    marginTop: 6,
  },
  btnText: {
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
    letterSpacing: 0.6,
  },
  termsError: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.rose,
    marginLeft: 4,
  },
  backBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  backText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.8,
  },
});
