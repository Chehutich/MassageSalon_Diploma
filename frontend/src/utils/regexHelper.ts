export const RegexHelper = {
  NameRegex: () => /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ' \-]{2,100}$/,

  EmailRegex: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  PhoneRegex: () => /^\+?[1-9]\d{1,14}$/,

  UrlRegex: () =>
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,

  HasLetter: () => /[a-zA-Zа-яА-ЯіІїЇєЄґҐ]/,

  PasswordRegex: () => /^(?=.*[a-zA-Zа-яА-ЯіІїЇєЄґҐ]).{8,}$/,
};
