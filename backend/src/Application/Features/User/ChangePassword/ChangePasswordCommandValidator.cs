using Application.Common.Constants;
using Application.Extensions;
using FluentValidation;

namespace Application.Features.User.ChangePassword;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.NewPassword)
            .PasswordRules();

        RuleFor(x => x.OldPassword)
            .PasswordRules()
            .NotEqual(x => x.NewPassword)
            .WithErrorCode(ValidationErrors.User.NotEqualNewPassword);

    }
}
