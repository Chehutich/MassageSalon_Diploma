export const PHONE_REGEX = /^\+?[\d\s\-()]{10,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const HAS_LETTER = /[a-zA-Z]/;

export type FormErrors<T extends string = string> = Partial<Record<T, string>>;

export type LoginErrors = FormErrors<"email" | "password">;
export type Step1Errors = FormErrors<"first" | "last" | "phone" | "email">;
export type Step2Errors = FormErrors<"password" | "confirm" | "terms">;
export type ForgotErrors = FormErrors<"email">;

export type PersonalData = {
  first: string;
  last: string;
  phone: string;
  email: string;
};
export type SecurityData = {
  password: string;
  confirm: string;
  terms: boolean;
  promo: boolean;
};

export const validateStep1 = (d: PersonalData) => {
  const e: Record<string, string> = {};
  if (!d.first.trim()) e.first = "Введіть ім'я";
  else if (d.first.trim().length < 2) e.first = "Мінімум 2 символи";
  if (!d.last.trim()) e.last = "Введіть прізвище";
  else if (d.last.trim().length < 2) e.last = "Мінімум 2 символи";
  if (!d.phone.trim()) e.phone = "Введіть номер телефону";
  else if (!PHONE_REGEX.test(d.phone)) e.phone = "Некоректний номер телефону";
  if (!d.email.trim()) e.email = "Введіть email";
  else if (!EMAIL_REGEX.test(d.email)) e.email = "Некоректний email";
  return e;
};

export const validateStep2 = (d: SecurityData) => {
  const e: Record<string, string> = {};
  if (!d.password) e.password = "Введіть пароль";
  else if (d.password.length < 8) e.password = "Мінімум 8 символів";
  else if (!HAS_LETTER.test(d.password))
    e.password = "Пароль має містити хоча б 1 літеру";
  if (!d.confirm) e.confirm = "Підтвердіть пароль";
  else if (d.password !== d.confirm) e.confirm = "Паролі не збігаються";
  if (!d.terms) e.terms = "Необхідно прийняти умови";
  return e;
};
