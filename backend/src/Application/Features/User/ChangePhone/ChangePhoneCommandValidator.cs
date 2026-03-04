using Application.Extensions;
using FluentValidation;

namespace Application.Features.User.ChangePhone;

public class ChangePhoneCommandValidator : AbstractValidator<ChangePhoneCommand>
{
    public ChangePhoneCommandValidator()
    {
        RuleFor(x => x.NewPhone)
            .PhoneRules();

        RuleFor(x => x.Password)
            .PasswordRules();
    }
}
