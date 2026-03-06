import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import { FontAwesome } from "@expo/vector-icons";
import { Palette } from "../../src/theme/tokens";
import { AmbientBackground } from "../../src/components/AmbientBackground";
import { PressButton } from "../../src/components/PressButton";
import { InputField } from "../../src/components/InputField";
import { AuthHeader } from "../../src/components/auth/AuthHeader";
import { AuthFooter } from "../../src/components/auth/AuthFooter";
import { SocialBtn, OrDivider } from "../../src/components/SocialAuth";
import {
  EMAIL_REGEX,
  HAS_LETTER,
  LoginErrors,
} from "../../src/utils/validation";
import { useLoginUser } from "@/src/api/generated/auth/auth";

export default function LoginScreen() {
  const [errors, setErrors] = useState<LoginErrors>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending } = useLoginUser();

  const handleLogin = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) newErrors.email = "Введіть email";
    else if (!EMAIL_REGEX.test(email)) newErrors.email = "Некоректний email";

    if (!password) newErrors.password = "Введіть пароль";
    else if (password.length < 8) newErrors.password = "Мінімум 8 символів";
    else if (!HAS_LETTER.test(password))
      newErrors.password = "Пароль має містити хоча б 1 літеру";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    login(
      { data: { email, password } },
      {
        onSuccess: async (data) => {
          console.log("tokens to save:", data.token, data.refreshToken);
          await SecureStore.setItemAsync("accessToken", data.token);
          await SecureStore.setItemAsync("refreshToken", data.refreshToken);
          router.replace("/(home)/home");
        },
        onError: (e: any) => {
          const status = e.response?.status;
          console.log("status:", e.response?.status);
          console.log("data:", JSON.stringify(e.response?.data));
          console.log("message:", e.message);

          if (status === 400 || status === 401) {
            setErrors({ password: "Невірний email або пароль" });
          } else {
            setErrors({ password: "Щось пішло не так. Спробуйте пізніше" });
          }
        },
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Palette.ivory }}>
      <AmbientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAwareScrollView
          bottomOffset={24}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.inner}>
            <AuthHeader
              title={"Ласкаво\nпросимо."}
              subtitle="Увійдіть, щоб керувати своїми записами"
            />

            <View style={styles.form}>
              <InputField
                label="Електронна пошта"
                value={email}
                onChangeText={(v: string) => {
                  setEmail(v);
                  if (errors.email)
                    setErrors((e) => ({ ...e, email: undefined }));
                }}
                isInvalid={!!errors.email}
                errorText={errors.email}
                placeholder="example@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={
                  <Mail size={20} color={Palette.taupe} strokeWidth={1.5} />
                }
              />

              <InputField
                label="Пароль"
                value={password}
                onChangeText={(v: string) => {
                  setPassword(v);
                  if (errors.password)
                    setErrors((e) => ({ ...e, password: undefined }));
                }}
                isInvalid={!!errors.password}
                errorText={errors.password}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                icon={
                  <Lock size={20} color={Palette.taupe} strokeWidth={1.5} />
                }
                rightElement={
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showPassword ? (
                      <Eye size={20} color={Palette.taupe} strokeWidth={1.5} />
                    ) : (
                      <EyeOff
                        size={20}
                        color={Palette.taupe}
                        strokeWidth={1.5}
                      />
                    )}
                  </TouchableOpacity>
                }
              />

              <TouchableOpacity onPress={() => router.push("/(auth)/forgot")}>
                <Text style={styles.forgotPassword}>Забули пароль?</Text>
              </TouchableOpacity>

              <PressButton
                title="Увійти"
                loading={isPending}
                onPress={handleLogin}
              />
            </View>

            <AuthFooter
              text="Ще немає акаунту? "
              linkText="Зареєструватись"
              onPress={() => router.replace("/(auth)/register")}
            />

            <OrDivider />

            <View style={styles.socialRow}>
              <SocialBtn
                icon={
                  <FontAwesome name="apple" size={20} color={Palette.taupe} />
                }
                label="Apple"
              />
              <SocialBtn
                icon={
                  <FontAwesome name="google" size={20} color={Palette.taupe} />
                }
                label="Google"
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 36,
  },
  form: { gap: 18 },
  forgotPassword: {
    textAlign: "right",
    fontSize: 13,
    color: Palette.taupe,
    fontFamily: "DMSans_500Medium",
  },
  socialRow: { flexDirection: "row", gap: 12, marginTop: 8 },
});
