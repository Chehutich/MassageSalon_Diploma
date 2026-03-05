// app/(auth)/forgot.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Mail, Check } from "lucide-react-native";
import { router } from "expo-router";
import { Palette } from "../../src/theme/tokens";
import { AmbientBackground } from "../../src/components/AmbientBackground";
import { InputField } from "../../src/components/InputField";
import { LeafLogo } from "../../src/components/LeafLogo";
import { ForgotErrors } from "../../src/utils/validation";

const StepEmail = ({ email, setEmail, onNext, errors, setErrors }: any) => (
  <View style={{ gap: 14 }}>
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
      icon={<Mail size={18} color={Palette.taupe} strokeWidth={1.6} />}
    />

    <TouchableOpacity
      onPress={onNext}
      activeOpacity={0.85}
      style={styles.primaryBtn}
    >
      <Text style={styles.primaryBtnText}>Надіслати код</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => router.replace("/(auth)/login")}
      style={{ alignItems: "center", paddingVertical: 4 }}
    >
      <Text style={styles.backText}>← Повернутись до входу</Text>
    </TouchableOpacity>
  </View>
);

const StepSuccess = ({ email }: { email: string }) => (
  <View style={{ alignItems: "center", gap: 20, paddingVertical: 20 }}>
    <View
      style={{
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Palette.sage + "33",
        borderWidth: 2,
        borderColor: Palette.sage + "55",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Check size={38} strokeWidth={1.8} color={Palette.sage} />
    </View>

    <View style={{ alignItems: "center", gap: 8 }}>
      <Text
        style={{
          fontSize: 30,
          fontFamily: "CormorantGaramond_600SemiBold",
          color: Palette.taupe,
          textAlign: "center",
          lineHeight: 36,
        }}
      >
        {"Перевірте\nпошту."}
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontFamily: "DMSans_400Regular",
          color: Palette.espresso,
          opacity: 0.65,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        {"Ми надіслали інструкції\nна " + email}
      </Text>
    </View>

    <View style={{ flexDirection: "row", gap: 10, opacity: 0.5 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === 1 ? Palette.rose : Palette.sage,
          }}
        />
      ))}
    </View>

    <TouchableOpacity
      onPress={() => router.replace("/(auth)/login")}
      activeOpacity={0.85}
      style={[styles.primaryBtn, { width: "100%" }]}
    >
      <Text style={styles.primaryBtnText}>Повернутись до входу</Text>
    </TouchableOpacity>

    <TouchableOpacity style={{ paddingVertical: 4 }}>
      <Text style={styles.backText}>Не отримали? Надіслати знову</Text>
    </TouchableOpacity>
  </View>
);

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
    <View style={{ flex: 1, backgroundColor: Palette.ivory }}>
      <AmbientBackground />
      <KeyboardAwareScrollView
        bottomOffset={24}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.inner}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <LeafLogo />
              <View>
                <Text style={styles.brandName}>SERENITY</Text>
                <Text style={styles.brandTagline}>Massage & Wellness</Text>
              </View>
            </View>

            {step === 1 && (
              <>
                <Text style={styles.title}>{"Забули\nпароль?"}</Text>
                <Text style={styles.subtitle}>
                  Введіть email — ми надішлемо інструкції для відновлення.
                </Text>
              </>
            )}
          </View>

          {/* FORM */}
          <View style={{ flex: 1 }}>
            {step === 1 && !loading && (
              <StepEmail
                email={email}
                setEmail={setEmail}
                onNext={handleNext}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {step === 1 && loading && (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 18,
                }}
              >
                <View style={styles.spinner} />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "CormorantGaramond_400Regular",
                    fontStyle: "italic",
                    color: Palette.taupe,
                    opacity: 0.7,
                  }}
                >
                  Надсилаємо лист…
                </Text>
              </View>
            )}
            {step === 2 && <StepSuccess email={email} />}
          </View>

          {/* FOOTER */}
          {step === 1 && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Згадали пароль? </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={styles.footerLink}>Увійти</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 52,
    paddingBottom: 36,
    justifyContent: "space-between",
  },
  header: { marginBottom: 20 },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  brandName: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 2,
    color: Palette.taupe,
    opacity: 0.7,
  },
  brandTagline: {
    fontSize: 13,
    fontFamily: "CormorantGaramond_400Regular",
    color: Palette.taupe,
  },
  title: {
    fontSize: 32,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.taupe,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 13.5,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
    opacity: 0.6,
    marginTop: 8,
    lineHeight: 20,
  },
  primaryBtn: {
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
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
    letterSpacing: 0.6,
  },
  backText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.8,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 13.5,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
    opacity: 0.7,
  },
  footerLink: {
    fontSize: 13.5,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    textDecorationLine: "underline",
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Palette.sandDark ?? "#D9C4AB",
    borderTopColor: Palette.rose,
  },
});
