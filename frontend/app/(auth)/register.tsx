import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { Palette } from "../../src/theme/tokens";
import { AmbientBackground } from "../../src/components/AmbientBackground";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { AuthHeader } from "../../src/components/auth/AuthHeader";
import { AuthFooter } from "../../src/components/auth/AuthFooter";
import { StepDot } from "../../src/components/auth/StepDot";
import { StepLine } from "../../src/components/auth/StepLine";
import { StepSuccess } from "../../src/components/auth/StepSuccess";
import { Step1Form } from "../../src/components/auth/register-steps/Step1Form";
import { Step2Form } from "../../src/components/auth/register-steps/Step2Form";
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
    promo: true,
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
    <KeyboardAwareScrollView
      bottomOffset={24}
      bounces={false}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.inner}>
        {step < 3 && (
          <>
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
          </>
        )}

        <View style={{ flex: 1, marginTop: 20 }}>
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
            <LoadingSpinner label="Створюємо ваш акаунт…" />
          )}
          {step === 3 && (
            <StepSuccess
              name={personal.first}
              onLogin={() => router.replace("/(auth)/login")}
            />
          )}
        </View>

        {step < 3 && (
          <AuthFooter
            text="Вже є акаунт? "
            linkText="Увійти"
            onPress={() => router.replace("/(auth)/login")}
          />
        )}
      </View>
    </KeyboardAwareScrollView>
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
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  stepLabel: {
    marginLeft: "auto" as any,
    fontSize: 11.5,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    opacity: 0.55,
  },
});
