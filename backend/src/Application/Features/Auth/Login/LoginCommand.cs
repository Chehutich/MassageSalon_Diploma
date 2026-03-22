using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Auth.Login;

public record LoginCommand(string Email, string Password) : IRequest<Result<AuthResponse, Error>>;

public class LoginCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator,
    IUnitOfWork unitOfWork) : IRequestHandler<LoginCommand, Result<AuthResponse, Error>>
{
    public async Task<Result<AuthResponse, Error>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is null || !passwordHasher.VerifyPassword(request.Password, user.PasswordHash ?? string.Empty)) // if this is guest user, passwordHash is null
        {
            return Errors.User.InvalidCredentials;
        }

        var accessToken = jwtTokenGenerator.GenerateToken(user);
        var (refreshToken, expiry) = jwtTokenGenerator.GenerateRefreshToken();

        user.SetRefreshToken(refreshToken, expiry);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            user.Id,
            user.FirstName,
            user.Email!,
            accessToken,
            refreshToken,
            user.Role.ToString());
    }
}
