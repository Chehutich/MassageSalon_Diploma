import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useToast } from "@/src/context/ToastContext";
import { Palette } from "@/src/theme/tokens";
import { LoadingSpinner } from "@/src/components/ui/feedback/LoadingSpinner";
import { AuthBrand, AuthHeader } from "@/src/components/auth/AuthHeader";
import { AuthFooter } from "@/src/components/auth/AuthFooter";
import { StepDot } from "@/src/components/auth/StepDot";
import { StepLine } from "@/src/components/auth/StepLine";
import { StepSuccess } from "@/src/components/auth/StepSuccess";
import { Step1Form } from "@/src/components/auth/register-steps/Step1Form";
import { Step2Form } from "@/src/components/auth/register-steps/Step2Form";
import { ScreenWrapper } from "@/src/components/layout/ScreenWrapper";
import { useRegisterUser } from "@/src/api/generated/auth/auth";

const registerSchema = z
  .object({
    first: z.string().min(1, "Введіть ім'я"),
    last: z.string().min(1, "Введіть прізвище"),
    phone: z.string().regex(/^\+[1-9]\d{6,14}$/, "Некоректний формат телефону"),
    email: z.string().min(1, "Введіть email").email("Некоректний формат email"),
    password: z
      .string()
      .min(8, "Мінімум 8 символів")
      .regex(/[a-zA-Z]/, "Пароль має містити хоча б 1 літеру"),
    confirm: z.string().min(1, "Підтвердіть пароль"),
    terms: z.boolean().refine((val) => val === true, {
      message: "Необхідно прийняти умови",
    }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Паролі не збігаються",
    path: ["confirm"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

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
  const { mutate: registerUser, isPending: loading } = useRegisterUser();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first: "",
      last: "",
      phone: "",
      email: "",
      password: "",
      confirm: "",
      terms: false,
    },
    mode: "onTouched",
  });

  const handleNext1 = async () => {
    const isStep1Valid = await trigger(["first", "last", "phone", "email"]);
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handleNext2 = async () => {
    const isStep2Valid = await trigger(["password", "confirm", "terms"]);
    if (isStep2Valid) {
      onSubmit(getValues());
    }
  };

  const onSubmit = (data: RegisterFormValues) => {
    registerUser(
      {
        data: {
          firstName: data.first,
          lastName: data.last,
          phone: data.phone,
          email: data.email,
          password: data.password
        },
      },
      {
        onSuccess: () => {
          setStep(3);
        },
        onError: (e: any) => {
          showToast(
            "error",
            "Помилка реєстрації",
            "Не вдалося створити акаунт"
          );
        },
      }
    );
  };

  const nameValue = getValues("first");

  return (
    <ScreenWrapper>
      <View style={styles.inner}>
        <AuthBrand />

        {step < 3 && <View style={{ flex: 1 }} />}

        <View style={[styles.bottomContainer, step === 3 && styles.successContainer]}>
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
            {step === 1 && <Step1Form control={control} onNext={handleNext1} />}
            {step === 2 && !loading && (
              <Step2Form
                control={control}
                errors={errors}
                onNext={handleNext2}
                onBack={() => setStep(1)}
              />
            )}
            {step === 2 && loading && (
              <View style={styles.loadingBox}>
                <LoadingSpinner label="Створюємо ваш акаунт…" />
              </View>
            )}
            {step === 3 && (
              <StepSuccess name={nameValue} onLogin={() => router.replace("/(auth)/login")} />
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
  bottomContainer: { gap: 32 },
  successContainer: { marginTop: "20%" },
  headerSection: { gap: 20 },
  formWrapper: { minHeight: 100 },
  loadingBox: { paddingVertical: 40, alignItems: "center" },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  stepLabel: {
    marginLeft: "auto",
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    opacity: 0.6,
  },
  footerSection: { marginTop: 8, alignItems: "center" },
});
