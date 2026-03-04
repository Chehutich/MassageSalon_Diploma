using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.User.RefreshToken;

public record RefreshTokenCommand(string AccessToken, string RefreshToken)
    : IRequest<Result<AuthResponse, Error>>;

public class RefreshTokenHandler(
    IUserRepository userRepository,
    IJwtTokenGenerator jwtTokenGenerator,
    IUnitOfWork unitOfWork) : IRequestHandler<RefreshTokenCommand, Result<AuthResponse, Error>>
{
    public async Task<Result<AuthResponse, Error>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var userId = jwtTokenGenerator.GetUserIdFromExpiredToken(request.AccessToken);
        if (userId is null)
        {
            return Errors.User.InvalidToken;
        }

        var user = await userRepository.GetByIdAsync(userId.Value, cancellationToken);
        if (user is null)
        {
            return Errors.User.NotFound(userId.Value);
        }

        if (user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiry <= DateTime.UtcNow)
        {
            return Errors.User.InvalidRefreshToken;
        }

        var newAccessToken = jwtTokenGenerator.GenerateToken(user);
        var (newRefreshToken, newExpiry) = jwtTokenGenerator.GenerateRefreshToken();

        user.SetRefreshToken(newRefreshToken, newExpiry);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            user.Id,
            user.FirstName,
            user.Email,
            newAccessToken,
            newRefreshToken);
    }
}

