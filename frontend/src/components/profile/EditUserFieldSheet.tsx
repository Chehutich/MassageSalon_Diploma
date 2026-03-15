import { UserMeResponse } from "@/src/api/generated/apiV1.schemas";
import {
  getGetMeQueryKey,
  useGetMe,
  useUpdateProfile,
} from "@/src/api/generated/user/user";
import { BottomSheet } from "@/src/components/ui/layout/BottomSheet";
import { RHFInputField } from "@/src/components/ui/forms/RHFInputField";
import { RHFPhoneInputField } from "@/src/components/ui/forms/RHFPhoneInputField";
import { RHFPasswordField } from "@/src/components/ui/forms/RHFPasswordField";
import { PressButton } from "@/src/components/ui/forms/PressButton";
import { ToastConfig, TopToast } from "@/src/components/ui/feedback/TopToast";
import { Palette } from "@/src/theme/tokens";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
      schema: z.string().min(2, "Некоректне ім'я").max(100, "Некоректне ім'я"),
    },
    lastName: {
      label: "Прізвище",
      placeholder: "Введіть ваше прізвище",
      schema: z.string().min(2, "Некоректне прізвище").max(100, "Некоректне прізвище"),
    },
    phone: {
      label: "Телефон",
      placeholder: "+380 (XX) XXX-XX-XX",
      schema: z.string().regex(/^\+[1-9]\d{6,14}$/, "Некоректний формат телефону"),
      keyboard: "phone-pad",
    },
    email: {
      label: "Email",
      placeholder: "example@mail.com",
      schema: z.string().email("Невірний формат пошти"),
      keyboard: "email-address",
      sensitive: true,
    },
    password: {
      label: "Новий пароль",
      placeholder: "••••••••",
      schema: z.string().min(8, "Мінімум 8 символів").regex(/[a-zA-Z]/, "Хоча б 1 літера"),
      isPassword: true,
      sensitive: true,
    },
  };

  const dynamicSchema = z.object({
    value: fieldId ? config[fieldId].schema : z.string(),
    ...(fieldId && config[fieldId].sensitive
      ? { currentPassword: z.string().min(1, "Введіть поточний пароль") }
      : {}),
  });

  type FormValues = z.infer<typeof dynamicSchema>;

  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: { value: "", currentPassword: "" },
  });

  const currentPass = watch("currentPassword");

  useEffect(() => {
    if (fieldId && fieldId !== "password" && me) {
      const val = me[fieldId as keyof UserMeResponse];
      reset({ value: val ? String(val) : "", currentPassword: "" });
    } else {
      reset({ value: "", currentPassword: "" });
    }
  }, [fieldId, me, reset]);

  const onSubmit = (data: FormValues) => {
    const payload: any = { [fieldId!]: data.value };
    if (config[fieldId!].sensitive) {
      payload.currentPassword = data.currentPassword;
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
            <RHFPasswordField
              name="value"
              control={control}
              label={config.password.label}
              placeholder={config.password.placeholder}
            />
          ) : fieldId === "phone" ? (
            <RHFPhoneInputField
              name="value"
              control={control}
              label={config.phone.label}
            />
          ) : (
            <RHFInputField
              name="value"
              control={control}
              label={config[fieldId!]?.label}
              placeholder={config[fieldId!]?.placeholder ?? ""}
              keyboardType={config[fieldId!]?.keyboard}
              secureTextEntry={config[fieldId!]?.isPassword}
            />
          )}

          {config[fieldId!]?.sensitive && (
            <View style={styles.sensitiveBox}>
              <Text style={styles.sensitiveNote}>
                Для підтвердження введіть поточний пароль
              </Text>
              <RHFPasswordField
                name="currentPassword"
                control={control}
                label="Поточний пароль"
              />
            </View>
          )}

          <View style={styles.keyboardSpacer} />

          <KeyboardStickyView offset={{ closed: 0, opened: 20 }}>
            <PressButton
              title={isLoading ? "Збереження..." : "Зберегти"}
              onPress={handleSubmit(onSubmit)}
              disabled={
                isLoading || (config[fieldId!]?.sensitive && !currentPass)
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
