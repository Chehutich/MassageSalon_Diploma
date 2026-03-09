using System.Text.RegularExpressions;

namespace Domain.Common;

public static partial class RegexHelper
{
    [GeneratedRegex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")]
    public static partial Regex EmailRegex();

    [GeneratedRegex(@"^\+?[1-9]\d{1,14}$")]
    public static partial Regex PhoneRegex();

    [GeneratedRegex(@"^[a-zA-Zа-яА-ЯіІїЇєЄґҐ' \-]{2,100}$")]
    public static partial Regex NameRegex();

    [GeneratedRegex(@"^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$")]
    public static partial Regex UrlRegex();

    [GeneratedRegex(@"[^a-z0-9\-]+")]
    public static partial Regex NonAlphanumericRegex();

    [GeneratedRegex(@"\-+")]
    public static partial Regex MultipleHyphensRegex();
}
