using Application.Common.Intefaces;
using Application.Common.Intefaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Queries.Login;

public record LoginQuery(string Email, string Password) : IRequest<Result<AuthResponse, Error>>;

public class LoginQueryHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator,
    IUnitOfWork unitOfWork) : IRequestHandler<LoginQuery, Result<AuthResponse, Error>>
{
    public async Task<Result<AuthResponse, Error>> Handle(LoginQuery request, CancellationToken ct)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, ct);

        if (user is null || !passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Errors.User.InvalidCredentials;
        }

        var accessToken = jwtTokenGenerator.GenerateToken(user);
        var (refreshToken, expiry) = jwtTokenGenerator.GenerateRefreshToken();

        user.SetRefreshToken(refreshToken, expiry);

        await unitOfWork.SaveChangesAsync(ct);

        return new AuthResponse(
            user.Id,
            user.FirstName,
            user.Email,
            accessToken,
            refreshToken);
    }
}
