import { RegexHelper } from "./regexHelper";
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
};

export const validateStep1 = (d: PersonalData) => {
  const e: Step1Errors = {};

  if (!d.first.trim()) e.first = "Введіть ім'я";
  else if (!RegexHelper.NameRegex().test(d.first.trim()))
    e.first = "Некоректне ім'я";

  if (!d.last.trim()) e.last = "Введіть прізвище";
  else if (!RegexHelper.NameRegex().test(d.last.trim()))
    e.last = "Некоректне прізвище";

  if (!d.phone.trim()) e.phone = "Введіть номер телефону";
  else if (!RegexHelper.PhoneRegex().test(d.phone))
    e.phone = "Некоректний формат (+380...)";

  if (!d.email.trim()) e.email = "Введіть email";
  else if (!RegexHelper.EmailRegex().test(d.email))
    e.email = "Некоректний формат email";

  return e;
};

export const validateStep2 = (d: SecurityData) => {
  const e: Step2Errors = {};

  if (!d.password) {
    e.password = "Введіть пароль";
  } else if (d.password.length < 8) {
    e.password = "Мінімум 8 символів";
  } else if (!/[a-zA-Z]/.test(d.password)) {
    e.password = "Пароль має містити хоча б 1 літеру";
  }

  if (!d.confirm) {
    e.confirm = "Підтвердіть пароль";
  } else if (d.password !== d.confirm) {
    e.confirm = "Паролі не збігаються";
  }

  if (!d.terms) {
    e.terms = "Необхідно прийняти умови";
  }

  return e;
};
