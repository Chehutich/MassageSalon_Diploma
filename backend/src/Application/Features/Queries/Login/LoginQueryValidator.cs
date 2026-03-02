using FluentValidation;

namespace Application.Features.Queries.Login;

public class LoginQueryValidator : AbstractValidator<LoginQuery>
{
    public LoginQueryValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithErrorCode("User.Email.Required")
            .EmailAddress().WithErrorCode("User.Email.InvalidFormat");

        RuleFor(x => x.Password)
            .NotEmpty().WithErrorCode("User.Password.Required")
            .MinimumLength(8).WithErrorCode("User.Password.MinLength");
    }
}
