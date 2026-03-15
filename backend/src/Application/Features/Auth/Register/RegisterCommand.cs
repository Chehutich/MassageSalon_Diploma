using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Auth.Register;

public record RegisterCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string Phone) : IRequest<Result<AuthResponse, Error>>;

public class RegisterCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator,
    IUnitOfWork unitOfWork) : IRequestHandler<RegisterCommand, Result<AuthResponse, Error>>
{
    public async Task<Result<AuthResponse, Error>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existingUserByEmailAsync = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUserByEmailAsync is not null)
        {
            return Errors.User.DuplicateEmail(request.Email);
        }

        var existingUserByPhoneAsync = await userRepository.GetByPhoneAsync(request.Phone, cancellationToken);
        if (existingUserByPhoneAsync is not null && existingUserByPhoneAsync.PasswordHash is not null)
        {
            return Errors.User.DuplicatePhone(request.Phone);
        }

        var hash = passwordHasher.HashPassword(request.Password);
        Domain.Entities.User user;

        if (existingUserByPhoneAsync is not null)
        {
            // It`s a guest user, so we need to upgrade it to a registered user
            user = existingUserByPhoneAsync;

            user.UpgradeGuestToRegistered(request.FirstName, request.LastName, request.Email, hash);
        }
        else
        {
            // I`m a new user, so I need to create a new user
            user = Domain.Entities.User.CreateRegistered(
                request.FirstName,
                request.LastName,
                request.Email,
                hash,
                request.Phone);

            await userRepository.AddAsync(user, cancellationToken);
        }

        var accessToken = jwtTokenGenerator.GenerateToken(user);
        var (refreshToken, expiry) = jwtTokenGenerator.GenerateRefreshToken();

        user.SetRefreshToken(refreshToken, expiry);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponse(user.Id, user.FirstName, user.Email!, accessToken, refreshToken, user.Role.ToString());
    }
}
