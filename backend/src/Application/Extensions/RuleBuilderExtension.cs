using Application.Common.Constants;
using FluentValidation;

namespace Application.Extensions;

public static class RuleBuilderExtension
{
    public static IRuleBuilderOptions<T, string> EmailRules<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithErrorCode(ValidationErrors.User.EmailRequired)
            .EmailAddress()
            .WithErrorCode(ValidationErrors.User.EmailInvalidFormat);
    }

    public static IRuleBuilderOptions<T, string> PasswordRules<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithErrorCode(ValidationErrors.User.PasswordRequired)
            .MinimumLength(8)
            .WithErrorCode(ValidationErrors.User.PasswordMinLength);
    }
    public static IRuleBuilderOptions<T, string> PhoneRules<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithErrorCode(ValidationErrors.User.PhoneRequired)
            .Matches(@"^\+?[1-9]\d{1,14}$")
            .WithErrorCode(ValidationErrors.User.PhoneInvalidFormat);
    }
}
