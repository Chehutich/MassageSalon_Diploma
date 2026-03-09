using Application.Common.Constants;
using Domain.Common;
using FluentValidation;

namespace Application.Extensions;

public static class RuleBuilderExtension
{
    public static IRuleBuilderOptions<T, string?> EmailRules<T>(this IRuleBuilder<T, string?> ruleBuilder)
    {
        return ruleBuilder
            .Matches(RegexHelper.EmailRegex()).WithErrorCode(ValidationErrors.User.InvalidEmailFormat);
    }

    public static IRuleBuilderOptions<T, string?> PasswordRules<T>(this IRuleBuilder<T, string?> ruleBuilder)
    {
        return ruleBuilder
            .MinimumLength(8).WithErrorCode(ValidationErrors.User.PasswordMinLength);
    }

    public static IRuleBuilderOptions<T, string?> PhoneRules<T>(this IRuleBuilder<T, string?> ruleBuilder)
    {
        return ruleBuilder
            .Matches(RegexHelper.PhoneRegex()).WithErrorCode(ValidationErrors.User.InvalidPhoneFormat);
    }

    public static IRuleBuilderOptions<T, string?> NameRules<T>(this IRuleBuilder<T, string?> ruleBuilder)
    {
        return ruleBuilder
            .Matches(RegexHelper.NameRegex()).WithErrorCode(ValidationErrors.User.InvalidNameFormat)
            .MaximumLength(100).WithErrorCode(ValidationErrors.User.NameMaxLength);
    }
}
