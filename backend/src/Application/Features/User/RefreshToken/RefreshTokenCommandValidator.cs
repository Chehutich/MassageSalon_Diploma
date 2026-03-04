using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.User.RefreshToken;

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.AccessToken)
            .NotEmpty().WithErrorCode(ValidationErrors.Token.AccessTokenRequired);

        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithErrorCode(ValidationErrors.Token.RefreshTokenRequired);
    }
}
