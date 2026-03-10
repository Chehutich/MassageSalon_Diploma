import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Mail, Check } from "lucide-react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingSpinner } from "@/src/components/ui/feedback/LoadingSpinner";
import { Palette } from "@/src/theme/tokens";
import { InputField } from "@/src/components/ui/forms/InputField";
import { AuthHeader } from "@/src/components/auth/AuthHeader";
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
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.inner}>
          <View style={styles.top}>
            <AuthHeader
              title={step === 1 ? "Забули\nпароль?" : "Перевірте\nпошту."}
              subtitle={
                step === 1
                  ? "Введіть email — ми надішлемо інструкції для відновлення."
                  : `Ми надіслали інструкції на ${email}`
              }
            />

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
              <LoadingSpinner label="Надсилаємо лист…" />
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
                  style={{ alignItems: "center", paddingVertical: 4 }}
                >
                  <Text style={styles.linkText}>
                    Не отримали? Надіслати знову
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 1 && !loading && (
              <AuthFooter
                text="Згадали пароль? "
                linkText="Увійти"
                onPress={() => router.replace("/(auth)/login")}
              />
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 36,
  },
  top: { gap: 18 },
  form: { gap: 18 },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Palette.sage + "33",
    borderWidth: 2,
    borderColor: Palette.sage + "55",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 8,
  },
  loadingBlock: {
    alignItems: "center",
    paddingTop: 20,
    gap: 18,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "CormorantGaramond_400Regular",
    fontStyle: "italic",
    color: Palette.taupe,
    opacity: 0.7,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Palette.sandDark ?? "#D9C4AB",
    borderTopColor: Palette.rose,
  },
  linkText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.8,
    textAlign: "center",
  },
});
