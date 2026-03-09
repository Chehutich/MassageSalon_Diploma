using Application.Common.Constants;
using Application.Extensions;
using FluentValidation;

namespace Application.Features.Auth.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FirstName)
            .NameRules();

        RuleFor(x => x.LastName)
            .NameRules();

        RuleFor(x => x.Email)
            .EmailRules();

        RuleFor(x => x.Password)
            .PasswordRules();

        RuleFor(x => x.Phone)
            .PhoneRules();
    }
}
