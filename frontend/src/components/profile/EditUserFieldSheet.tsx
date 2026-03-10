import { UserMeResponse } from "@/src/api/generated/apiV1.schemas";
import {
  getGetMeQueryKey,
  useGetMe,
  useUpdateProfile,
} from "@/src/api/generated/user/user";
import { BottomSheet } from "@/src/components/ui/layout/BottomSheet";
import { InputField } from "@/src/components/ui/forms/InputField";
import { PressButton } from "@/src/components/ui/forms/PressButton";
import { ToastConfig, TopToast } from "@/src/components/ui/feedback/TopToast";
import { Palette } from "@/src/theme/tokens";
import { RegexHelper } from "@/src/utils/regexHelper";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { PasswordField } from "@/src/components/ui/forms/PasswordField";

export function EditUserFieldSheet({
  fieldId,
  onClose,
}: {
  fieldId: keyof UserMeResponse | "password" | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: me } = useGetMe();
  const { mutate: update, isPending: isLoading } = useUpdateProfile();

  const [value, setValue] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastConfig>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const showToast = (
    type: "success" | "error",
    title: string,
    message: string,
  ) => {
    setToast({ visible: true, type, title, message });
  };

  const config: any = {
    firstName: {
      label: "Ім'я",
      placeholder: "Введіть ваше ім'я",
      regex: RegexHelper.NameRegex(),
      error: "Некоректне ім'я",
    },
    lastName: {
      label: "Прізвище",
      placeholder: "Введіть ваше прізвище",
      regex: RegexHelper.NameRegex(),
      error: "Некоректне прізвище",
    },
    phone: {
      label: "Телефон",
      placeholder: "+380 (XX) XXX-XX-XX",
      regex: RegexHelper.PhoneRegex(),
      error: "Некоректний формат телефону",
      keyboard: "phone-pad",
    },
    email: {
      label: "Email",
      placeholder: "example@mail.com",
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
      const val = me[fieldId as keyof UserMeResponse];
      setValue(val ? String(val) : "");
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
          queryClient.invalidateQueries({
            queryKey: getGetMeQueryKey(),
          });

          showToast("success", "Оновлено", "Ваші дані успішно збережено");

          onClose();
        },
        onError: (err: any) => {
          showToast("error", "Помилка", "Упс. Невдалося оновити");
        },
      },
    );
  };

  return (
    <>
      <BottomSheet visible={!!fieldId} onClose={onClose} title="Редагування">
        <View style={styles.content}>
          {fieldId === "password" ? (
            <PasswordField
              label={config.password.label}
              value={value}
              placeholder={config.password.placeholder}
              onChangeText={setValue}
              isInvalid={!!error}
              errorText={error}
            />
          ) : (
            <InputField
              label={config[fieldId!]?.label}
              value={value}
              onChangeText={(t: string) => {
                setValue(t);
                setError(null);
              }}
              placeholder={config[fieldId!]?.placeholder ?? ""}
              isInvalid={!!error}
              errorText={error}
              keyboardType={config[fieldId!]?.keyboard}
              secureTextEntry={config[fieldId!]?.isPassword}
            />
          )}

          {config[fieldId!]?.sensitive && (
            <View style={styles.sensitiveBox}>
              <Text style={styles.sensitiveNote}>
                Для підтвердження введіть поточний пароль
              </Text>
              <PasswordField
                label="Поточний пароль"
                value={currentPassword}
                onChangeText={(t: string) => {
                  setCurrentPassword(t);
                  setError(null);
                }}
                isInvalid={!!error}
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
      <TopToast
        {...toast}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </>
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
