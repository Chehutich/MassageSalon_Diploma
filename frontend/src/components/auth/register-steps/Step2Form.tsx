import { SecurityData, Step2Errors } from "@/src/utils/validation";
import { Check, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Palette } from "@/src/theme/tokens";
import { Checkbox } from "@/src/components/ui/forms/Checkbox";
import { PasswordField } from "@/src/components/ui/forms/PasswordField";
import { StrengthBar } from "@/src/components/auth/StrengthBar";

type Props = {
  data: SecurityData;
  errors: Step2Errors;
  onChange: (field: keyof SecurityData, value: string | boolean) => void;
  onNext: () => void;
  onBack: () => void;
};

export const Step2Form = ({
  data,
  errors,
  onChange,
  onNext,
  onBack,
}: Props) => {
  const match = data.password && data.confirm && data.password === data.confirm;
  const noMatch = data.confirm.length > 0 && data.password !== data.confirm;

  return (
    <View style={{ gap: 14 }}>
      <PasswordField
        label="Пароль"
        value={data.password}
        onChangeText={(v: string) => onChange("password", v)}
        isInvalid={!!errors.password}
        errorText={errors.password}
      />

      <StrengthBar password={data.password} />

      <PasswordField
        label="Підтвердження паролю"
        value={data.confirm}
        onChangeText={(v: string) => onChange("confirm", v)}
        isInvalid={!!errors.confirm}
        errorText={errors.confirm}
        // You might need to adjust PasswordField to support rightElement or similar
        // if you want to keep the green check/red X icons. Assuming PasswordField
        // only handles visibility toggling by default.
        // If PasswordField supports a custom right element, you'd pass it here:
        // customRightElement={
        //   <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginRight: 8 }}>
        //     {match && <Check size={16} strokeWidth={2.2} color={Palette.sage} />}
        //     {noMatch && <X size={16} strokeWidth={2} color={Palette.rose} />}
        //   </View>
        // }
      />

      <Checkbox
        checked={data.terms}
        onToggle={() => onChange("terms", !data.terms)}
        label="Я погоджуюсь з Умовами використання та Політикою конфіденційності"
      />
      {errors.terms && <Text style={styles.termsError}>{errors.terms}</Text>}

      <TouchableOpacity
        onPress={onNext}
        activeOpacity={0.85}
        style={styles.btn}
      >
        <Text style={styles.btnText}>Створити акаунт</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onBack}
        style={{ alignItems: "center", paddingVertical: 4 }}
      >
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
  backText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.8,
  },
});
