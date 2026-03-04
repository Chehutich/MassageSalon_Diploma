using Application.Extensions;
using FluentValidation;

namespace Application.Features.User.ChangeEmail;

public class ChangeEmailCommandValidator : AbstractValidator<ChangeEmailCommand>
{
    public ChangeEmailCommandValidator()
    {
        RuleFor(x => x.NewEmail)
            .EmailRules();

        RuleFor(x => x.Password)
            .PasswordRules();
    }
}
