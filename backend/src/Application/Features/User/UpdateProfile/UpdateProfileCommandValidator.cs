using Application.Common.Constants;
using Application.Extensions;
using Domain.Common;
using FluentValidation;

namespace Application.Features.User.UpdateProfile;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.FirstName)
            .NameRules()
            .When(x => x.FirstName != null);

        RuleFor(x => x.LastName)
            .NameRules()
            .When(x => x.LastName != null);

        RuleFor(x => x.Email)
            .EmailRules()
            .When(x => x.Email != null);

        RuleFor(x => x.Phone)
            .PhoneRules()
            .When(x => x.Phone != null);

        RuleFor(x => x.NewPassword)
            .PasswordRules()
            .When(x => x.NewPassword != null);

        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithErrorCode(ValidationErrors.User.CurrentPasswordRequired)
            .When(x => x.NewPassword != null || x.Email != null);
    }
}
