using FluentValidation;

namespace Application.Features.Commands.ChangePassword;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithErrorCode("User.NewPassword.Required")
            .MinimumLength(8).WithErrorCode("User.NewPassword.MinLength");

        RuleFor(x => x.OldPassword)
            .NotEmpty().WithErrorCode("User.OldPassword.Required")
            .MinimumLength(8).WithErrorCode("User.OldPassword.MinLength")
            .NotEqual(x => x.NewPassword).WithErrorCode("User.OldPassword.NotEqualNewPassword");

    }
}
