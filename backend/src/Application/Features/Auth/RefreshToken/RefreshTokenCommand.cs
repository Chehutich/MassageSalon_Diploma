using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Auth.RefreshToken;

public record RefreshTokenCommand(string AccessToken, string RefreshToken)
    : IRequest<Result<AuthResponse, Error>>;

public class RefreshTokenHandler(
    IUserRepository userRepository,
    IJwtTokenGenerator jwtTokenGenerator,
    IUnitOfWork unitOfWork) : IRequestHandler<RefreshTokenCommand, Result<AuthResponse, Error>>
{
    public async Task<Result<AuthResponse, Error>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByRefreshTokenAsync(request.RefreshToken, cancellationToken);
        if (user is null || user.RefreshTokenExpiry <= DateTime.UtcNow)
        {
            return Errors.User.InvalidRefreshToken;
        }

        if (!string.IsNullOrWhiteSpace(request.AccessToken))
        {
            var userIdFromToken = jwtTokenGenerator.GetUserIdFromExpiredToken(request.AccessToken);
            if (userIdFromToken != null && userIdFromToken != user.Id)
            {
                return Errors.User.InvalidAccessToken;
            }
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
            newRefreshToken,
            user.Role.ToString());
    }
}

