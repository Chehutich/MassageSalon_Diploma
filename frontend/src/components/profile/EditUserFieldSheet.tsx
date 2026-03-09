import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Palette } from "@/src/theme/tokens";
import { InputField } from "@/src/components/InputField";
import { BottomSheet } from "@/src/components/BottomSheet";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { PressButton } from "@/src/components/PressButton";
import { useGetMe, useUpdateProfile } from "@/src/api/generated/user/user";
import { Lock } from "lucide-react-native";
import { RegexHelper } from "@/src/utils/regexHelper";

export function EditUserFieldSheet({
  fieldId,
  onClose,
}: {
  fieldId: string | null;
  onClose: () => void;
}) {
  const { data: me } = useGetMe();
  const { mutate: update, isPending: isLoading } = useUpdateProfile();

  const [value, setValue] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const config: any = {
    firstName: {
      label: "Ім'я",
      regex: RegexHelper.NameRegex(),
      error: "Некоректне ім'я (мінімум 2 символи)",
    },
    lastName: {
      label: "Прізвище",
      regex: RegexHelper.NameRegex(),
      error: "Некоректне прізвище (мінімум 2 символи)",
    },
    phone: {
      label: "Телефон",
      regex: RegexHelper.PhoneRegex(),
      error: "Некоректний формат телефону",
      keyboard: "phone-pad",
    },
    email: {
      label: "Email",
      regex: RegexHelper.EmailRegex(),
      error: "Невірний формат пошти",
      keyboard: "email-address",
      sensitive: true,
    },
    password: {
      label: "Новий пароль",
      regex: RegexHelper.PasswordRegex(),
      error: "Мінімум 8 символів та хоча б 1 літера",
      isPassword: true,
      sensitive: true,
    },
  };

  useEffect(() => {
    if (fieldId && fieldId !== "password" && me) {
      // @ts-ignore
      setValue(me[fieldId] || "");
    } else {
      setValue("");
    }
    setCurrentPassword("");
    setError(null);
  }, [fieldId, me]);

  const handleSave = () => {
    const activeConfig = config[fieldId!];
    if (activeConfig && !activeConfig.regex.test(value)) {
      setError(activeConfig.error);
      return;
    }

    const payload: any = { [fieldId!]: value };
    if (activeConfig.sensitive) {
      payload.currentPassword = currentPassword;
    }

    update(
      { data: payload },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          setError(err.response?.data?.Detail || "Помилка оновлення");
        },
      },
    );
  };

  return (
    <BottomSheet visible={!!fieldId} onClose={onClose} title="Редагування">
      <View style={styles.content}>
        <InputField
          label={config[fieldId!]?.label}
          value={value}
          onChangeText={(t: string) => {
            setValue(t);
            setError(null);
          }}
          isInvalid={!!error}
          errorText={error}
          keyboardType={config[fieldId!]?.keyboard}
          secureTextEntry={config[fieldId!]?.isPassword}
        />

        {config[fieldId!]?.sensitive && (
          <View style={styles.sensitiveBox}>
            <Text style={styles.sensitiveNote}>
              Для підтвердження введіть поточний пароль
            </Text>
            <InputField
              label="Поточний пароль"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              icon={<Lock size={18} color={Palette.rose} />}
            />
          </View>
        )}

        <View style={styles.keyboardSpacer} />

        <KeyboardStickyView offset={{ closed: 0, opened: 20 }}>
          <PressButton
            title={isLoading ? "Збереження..." : "Зберегти"}
            onPress={handleSave}
            disabled={
              isLoading || (config[fieldId!]?.sensitive && !currentPassword)
            }
            style={{ marginTop: 10 }}
          />
        </KeyboardStickyView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },
  keyboardSpacer: {
    height: 300,
  },
  title: {
    fontSize: 22,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
    marginBottom: 8,
  },
  sensitiveBox: { marginTop: 4, gap: 12 },
  sensitiveNote: {
    fontSize: 13,
    color: Palette.rose,
    fontFamily: "DMSans_400Regular",
    opacity: 0.8,
  },
});
