import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Palette } from "@/src/theme/tokens";
import { PressButton } from "@/src/components/ui/forms/PressButton";
import { AuthBrand, AuthHeader } from "@/src/components/auth/AuthHeader";
import { AuthFooter } from "@/src/components/auth/AuthFooter";
import { SocialBtn, OrDivider } from "@/src/components/auth/SocialAuth";
import { useLoginUser } from "@/src/api/generated/auth/auth";
import { RHFInputField } from "@/src/components/ui/forms/RHFInputField";
import { RHFPasswordField } from "@/src/components/ui/forms/RHFPasswordField";
import { ScreenWrapper } from "@/src/components/layout/ScreenWrapper";
import { useAuthSession } from "@/src/hooks/useAuthSession";
import { useToast } from "@/src/context/ToastContext";

const loginSchema = z.object({
  email: z.string().min(1, "Введіть email").email("Некоректний email"),
  password: z
    .string()
    .min(1, "Введіть пароль")
    .min(8, "Мінімум 8 символів")
    .regex(/[a-zA-Z]/, "Пароль має містити хоча б 1 літеру"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { mutate: login, isPending } = useLoginUser();
  const { login: setSession } = useAuthSession();
  const { showToast } = useToast();

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(
      { data },
      {
        onSuccess: async (res) => {
          await setSession(res.token, res.refreshToken, res.role);
        },
        onError: (e: any) => {
          const status = e.response?.status;
          if (status === 400 || status === 401) {
            showToast("error", "Помилка авторизації", "Невірний email або пароль");
          } else {
            showToast("error", "Помилка", "Щось пішло не так. Спробуйте пізніше");
          }
        },
      }
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.inner}>
        <AuthBrand />
        <View style={{ flex: 3 }} />

        <View style={styles.bottomContainer}>
          <AuthHeader
            title={"Ласкаво\nпросимо."}
            subtitle="Увійдіть, щоб керувати своїми записами"
          />

          <View style={styles.form}>
            <RHFInputField
              name="email"
              control={control}
              label="Електронна пошта"
              placeholder="example@mail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={20} color={Palette.taupe} strokeWidth={1.5} />}
            />

            <RHFPasswordField
              name="password"
              control={control}
              label="Пароль"
              placeholder="••••••••"
            />

            <TouchableOpacity onPress={() => router.replace("/(auth)/forgot")}>
              <Text style={styles.forgotPassword}>Забули пароль?</Text>
            </TouchableOpacity>

            <PressButton
              title="Увійти"
              loading={isPending}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <AuthFooter
            text="Ще немає акаунту? "
            linkText="Зареєструватись"
            onPress={() => router.replace("/(auth)/register")}
          />

          <OrDivider />

          <View style={styles.socialRow}>
            <SocialBtn
              icon={<FontAwesome name="apple" size={20} color={Palette.taupe} />}
              label="Apple"
            />
            <SocialBtn
              icon={<FontAwesome name="google" size={20} color={Palette.taupe} />}
              label="Google"
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 36,
  },
  bottomContainer: {
    gap: 32,
  },
  form: {
    gap: 18,
  },
  forgotPassword: {
    textAlign: "right",
    fontSize: 13,
    color: Palette.taupe,
    fontFamily: "DMSans_500Medium",
    marginTop: -4,
  },
  actions: {
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
  },
});
