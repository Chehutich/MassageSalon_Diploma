using FluentValidation;

namespace Application.Features.Commands.Login;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithErrorCode("User.Email.Required")
            .EmailAddress().WithErrorCode("User.Email.InvalidFormat");

        RuleFor(x => x.Password)
            .NotEmpty().WithErrorCode("User.Password.Required")
            .MinimumLength(8).WithErrorCode("User.Password.MinLength");
    }
}
