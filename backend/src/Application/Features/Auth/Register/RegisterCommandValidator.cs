using Application.Common.Constants;
using Application.Extensions;
using FluentValidation;

namespace Application.Features.Auth.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithErrorCode(ValidationErrors.User.FirstNameRequired)
            .MaximumLength(50)
            .WithErrorCode(ValidationErrors.User.FirstNameMaxLength);

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithErrorCode(ValidationErrors.User.LastNameRequired)
            .MaximumLength(50)
            .WithErrorCode(ValidationErrors.User.LastNameMaxLength);

        RuleFor(x => x.Email)
            .EmailRules();

        RuleFor(x => x.Password)
            .PasswordRules();

        RuleFor(x => x.Phone)
            .PhoneRules();
    }
}
