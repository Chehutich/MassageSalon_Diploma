using FluentValidation;

namespace Application.Features.Commands.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithErrorCode("User.FirstName.Required")
            .MaximumLength(50).WithErrorCode("User.FirstName.MaxLength");

        RuleFor(x => x.LastName)
            .NotEmpty().WithErrorCode("User.LastName.Required")
            .MaximumLength(50).WithErrorCode("User.LastName.MaxLength");

        RuleFor(x => x.Email)
            .NotEmpty().WithErrorCode("User.Email.Required")
            .EmailAddress().WithErrorCode("User.Email.InvalidFormat");

        RuleFor(x => x.Password)
            .NotEmpty().WithErrorCode("User.Password.Required")
            .MinimumLength(8).WithErrorCode("User.Password.MinLength");

        RuleFor(x => x.Phone)
            .MaximumLength(15).WithErrorCode("User.Phone.MaxLength")
            .Matches(@"^\+?[1-9]\d{6,14}$").WithErrorCode("User.Phone.InvalidFormat")
            .When(x => !string.IsNullOrEmpty(x.Phone));
    }
}
