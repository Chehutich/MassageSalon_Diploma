import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react-native";
import { Palette } from "../../../theme/tokens";
import { InputField } from "../../InputField";
import { Checkbox } from "../Checkbox";
import { StrengthBar } from "../StrengthBar";
import { SecurityData, Step2Errors } from "../../../utils/validation";

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
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);

  const match = data.password && data.confirm && data.password === data.confirm;
  const noMatch = data.confirm.length > 0 && data.password !== data.confirm;

  return (
    <View style={{ gap: 14 }}>
      <InputField
        label="Пароль"
        value={data.password}
        onChangeText={(v: string) => onChange("password", v)}
        isInvalid={!!errors.password}
        errorText={errors.password}
        secureTextEntry={!showPw}
        icon={<Lock size={18} color={Palette.taupe} strokeWidth={1.6} />}
        rightElement={
          <TouchableOpacity
            onPress={() => setShowPw((v) => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPw ? (
              <Eye size={20} color={Palette.taupe} strokeWidth={1.5} />
            ) : (
              <EyeOff size={20} color={Palette.taupe} strokeWidth={1.5} />
            )}
          </TouchableOpacity>
        }
      />
      <StrengthBar password={data.password} />

      <InputField
        label="Підтвердження паролю"
        value={data.confirm}
        onChangeText={(v: string) => onChange("confirm", v)}
        isInvalid={!!errors.confirm}
        errorText={errors.confirm}
        secureTextEntry={!showCf}
        icon={<Lock size={18} color={Palette.taupe} strokeWidth={1.6} />}
        rightElement={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {match && (
              <Check size={16} strokeWidth={2.2} color={Palette.sage} />
            )}
            {noMatch && <X size={16} strokeWidth={2} color={Palette.rose} />}
            <TouchableOpacity
              onPress={() => setShowCf((v) => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showCf ? (
                <Eye size={20} color={Palette.taupe} strokeWidth={1.5} />
              ) : (
                <EyeOff size={20} color={Palette.taupe} strokeWidth={1.5} />
              )}
            </TouchableOpacity>
          </View>
        }
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
