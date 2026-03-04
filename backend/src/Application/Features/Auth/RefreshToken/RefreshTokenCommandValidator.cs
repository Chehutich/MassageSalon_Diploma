using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.Auth.RefreshToken;

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithErrorCode(ValidationErrors.Token.RefreshTokenRequired);
    }
}
