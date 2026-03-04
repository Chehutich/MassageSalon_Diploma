using Application.Extensions;
using FluentValidation;

namespace Application.Features.Auth.Login;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .EmailRules();

        RuleFor(x => x.Password)
            .PasswordRules();
    }
}
