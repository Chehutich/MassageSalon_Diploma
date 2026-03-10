import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { Palette } from "../../src/theme/tokens";
import { LoadingSpinner } from "@/src/components/ui/feedback/LoadingSpinner";
import { AuthBrand, AuthHeader } from "@/src/components/auth/AuthHeader";
import { AuthFooter } from "@/src/components/auth/AuthFooter";
import { StepDot } from "@/src/components/auth/StepDot";
import { StepLine } from "@/src/components/auth/StepLine";
import { StepSuccess } from "@/src/components/auth/StepSuccess";
import { Step1Form } from "@/src/components/auth/register-steps/Step1Form";
import { Step2Form } from "@/src/components/auth/register-steps/Step2Form";
import {
  validateStep1,
  validateStep2,
  PersonalData,
  SecurityData,
  Step1Errors,
  Step2Errors,
} from "../../src/utils/validation";

const STEP_CONFIG = {
  1: {
    title: "Створіть\nакаунт.",
    subtitle: "Приєднуйтесь до Serenity для легкого запису.",
  },
  2: {
    title: "Оберіть\nпароль.",
    subtitle: "Захистіть свій особистий простір.",
  },
};

export default function RegisterScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({});
  const [personal, setPersonal] = useState<PersonalData>({
    first: "",
    last: "",
    phone: "",
    email: "",
  });
  const [security, setSecurity] = useState<SecurityData>({
    password: "",
    confirm: "",
    terms: false,
  });

  const handlePersonalChange = useCallback(
    (field: keyof PersonalData, value: string) => {
      setPersonal((p) => ({ ...p, [field]: value }));
      setStep1Errors((e) => ({ ...e, [field]: undefined }));
    },
    [],
  );

  const handleSecurityChange = useCallback(
    (field: keyof SecurityData, value: string | boolean) => {
      setSecurity((p) => ({ ...p, [field]: value }));
      setStep2Errors((e) => ({ ...e, [field]: undefined }));
    },
    [],
  );

  const handleNext1 = () => {
    const errs = validateStep1(personal);
    if (Object.keys(errs).length) {
      setStep1Errors(errs);
      return;
    }
    setStep1Errors({});
    setStep(2);
  };

  const handleNext2 = () => {
    const errs = validateStep2(security);
    if (Object.keys(errs).length) {
      setStep2Errors(errs);
      return;
    }
    setStep2Errors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1800);
  };

  const handleBack = () => {
    setStep(1);
    setStep2Errors({});
  };

  return (
    <View style={styles.root}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollGrow}
      >
        <View style={styles.inner}>
          {/* 1. БРЕНД: Завжди в самому верху */}
          <AuthBrand />

          {/* 2. ПРУЖИНА: Розштовхує бренд та форму (тільки на кроках 1 і 2) */}
          {step < 3 && <View style={{ flex: 1 }} />}

          {/* 3. ОСНОВНИЙ КОНТЕНТ */}
          <View
            style={[
              styles.bottomContainer,
              step === 3 && styles.successContainer,
            ]}
          >
            {step < 3 && (
              <View style={styles.headerSection}>
                <AuthHeader
                  title={STEP_CONFIG[step as 1 | 2].title}
                  subtitle={STEP_CONFIG[step as 1 | 2].subtitle}
                />
                <View style={styles.stepRow}>
                  <StepDot num={1} active={step === 1} done={step > 1} />
                  <StepLine done={step > 1} />
                  <StepDot num={2} active={step === 2} done={step > 2} />
                  <Text style={styles.stepLabel}>Крок {step} з 2</Text>
                </View>
              </View>
            )}

            <View style={styles.formWrapper}>
              {step === 1 && (
                <Step1Form
                  data={personal}
                  errors={step1Errors}
                  onChange={handlePersonalChange}
                  onNext={handleNext1}
                />
              )}
              {step === 2 && !loading && (
                <Step2Form
                  data={security}
                  errors={step2Errors}
                  onChange={handleSecurityChange}
                  onNext={handleNext2}
                  onBack={handleBack}
                />
              )}
              {step === 2 && loading && (
                <View style={styles.loadingBox}>
                  <LoadingSpinner label="Створюємо ваш акаунт…" />
                </View>
              )}
              {step === 3 && (
                <StepSuccess
                  name={personal.first}
                  onLogin={() => router.replace("/(auth)/login")}
                />
              )}
            </View>

            {step < 3 && (
              <View style={styles.footerSection}>
                <AuthFooter
                  text="Вже є акаунт? "
                  linkText="Увійти"
                  onPress={() => router.replace("/(auth)/login")}
                />
              </View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.ivory,
  },
  scrollGrow: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24, // Невеличкий відступ для AuthBrand
    paddingBottom: 36,
  },
  bottomContainer: {
    // Вся форма і заголовки групуються разом знизу
    gap: 32,
  },
  successContainer: {
    // Для екрану успіху робимо відступ зверху замість flex:1,
    // щоб він не втікав занадто низько
    marginTop: "20%",
  },
  headerSection: {
    gap: 20,
  },
  formWrapper: {
    minHeight: 100, // Запобігає стрибкам при зміні контенту
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  stepLabel: {
    marginLeft: "auto",
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    opacity: 0.6,
  },
  footerSection: {
    marginTop: 8,
    alignItems: "center",
  },
});
