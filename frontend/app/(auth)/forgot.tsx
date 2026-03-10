import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Mail, Check } from "lucide-react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingSpinner } from "@/src/components/ui/feedback/LoadingSpinner";
import { Palette } from "@/src/theme/tokens";
import { InputField } from "@/src/components/ui/forms/InputField";
import { AuthBrand, AuthHeader } from "@/src/components/auth/AuthHeader";
import { AuthFooter } from "@/src/components/auth/AuthFooter";
import { PressButton } from "@/src/components/ui/forms/PressButton";
import { ForgotErrors } from "@/src/utils/validation";
import { RegexHelper } from "@/src/utils/regexHelper";

export default function ForgotScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ForgotErrors>({});

  const handleNext = () => {
    if (!email.trim()) {
      setErrors({ email: "Введіть email" });
      return;
    }
    if (!RegexHelper.EmailRegex().test(email)) {
      setErrors({ email: "Некоректний email" });
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollGrow}
      >
        <View style={styles.inner}>
          {/* 1. БРЕНД: Статично вгорі */}
          <AuthBrand />

          {/* 2. ПРУЖИНА: Штовхає контент вниз (тільки на першому кроці) */}
          {step === 1 && <View style={{ flex: 1 }} />}

          {/* 3. ОСНОВНИЙ КОНТЕНТ */}
          <View style={[styles.container, step === 2 && styles.successLayout]}>
            <AuthHeader
              title={step === 1 ? "Забули\nпароль?" : "Перевірте\nпошту."}
              subtitle={
                step === 1
                  ? "Введіть email — ми надішлемо інструкції для відновлення."
                  : `Ми надіслали інструкції на ${email}`
              }
            />

            <View style={styles.formWrapper}>
              {step === 1 && !loading && (
                <View style={styles.form}>
                  <InputField
                    label="Електронна пошта"
                    value={email}
                    onChangeText={(v: string) => {
                      setEmail(v);
                      if (errors.email) setErrors({});
                    }}
                    isInvalid={!!errors.email}
                    errorText={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="example@mail.com"
                    icon={
                      <Mail size={20} color={Palette.taupe} strokeWidth={1.5} />
                    }
                  />
                  <PressButton title="Надіслати код" onPress={handleNext} />
                </View>
              )}

              {step === 1 && loading && (
                <View style={styles.loadingWrapper}>
                  <LoadingSpinner label="Надсилаємо лист…" />
                </View>
              )}

              {step === 2 && (
                <View style={styles.form}>
                  <View style={styles.successIcon}>
                    <Check size={38} strokeWidth={1.8} color={Palette.sage} />
                  </View>
                  <PressButton
                    title="Повернутись до входу"
                    onPress={() => router.replace("/(auth)/login")}
                  />
                  <TouchableOpacity
                    style={{ alignItems: "center", paddingVertical: 8 }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resendText}>
                      Не отримали? Надіслати знову
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ФУТЕР */}
            {step === 1 && !loading && (
              <View style={styles.footerWrapper}>
                <AuthFooter
                  text="Згадали пароль? "
                  linkText="Увійти"
                  onPress={() => router.replace("/(auth)/login")}
                />
              </View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.ivory },
  scrollGrow: { flexGrow: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 36,
  },
  container: {
    gap: 32,
  },
  successLayout: {
    // На кроці успіху центруємо трохи вище, ніж форму
    marginTop: "20%",
  },
  formWrapper: {
    minHeight: 120,
  },
  form: { gap: 18 },
  loadingWrapper: {
    paddingVertical: 40,
    alignItems: "center",
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Palette.sage + "15",
    borderWidth: 1,
    borderColor: Palette.sage + "30",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  resendText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.8,
    textAlign: "center",
  },
  footerWrapper: {
    marginTop: 8,
    alignItems: "center",
  },
});
