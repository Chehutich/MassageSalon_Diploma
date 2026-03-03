using FluentValidation;

namespace Application.Features.Commands.ChangeEmail;

public class ChangeEmailCommandValidator : AbstractValidator<ChangeEmailCommand>
{
    public ChangeEmailCommandValidator()
    {
        RuleFor(x => x.NewEmail)
            .NotEmpty().WithErrorCode("User.NewEmail.Required")
            .EmailAddress().WithErrorCode("User.NewEmail.InvalidFormat");

        RuleFor(x => x.Password)
            .NotEmpty().WithErrorCode("User.Password.Required")
            .MinimumLength(8).WithErrorCode("User.Password.MinLength");
    }
}
