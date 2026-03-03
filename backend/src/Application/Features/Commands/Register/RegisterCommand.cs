using Application.Common.Intefaces;
using Application.Common.Intefaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Entities;
using Domain.Errors;
using MediatR;

namespace Application.Features.Commands.Register;

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

        if (existingUserByPhoneAsync is not null)
        {
            return Errors.User.DuplicatePhone(request.Phone);
        }

        var hash = passwordHasher.HashPassword(request.Password);

        var user = new User(
            request.FirstName,
            request.LastName,
            request.Email,
            hash,
            request.Phone);

        var accessToken = jwtTokenGenerator.GenerateToken(user);
        var (refreshToken, expiry) = jwtTokenGenerator.GenerateRefreshToken();

        user.SetRefreshToken(refreshToken, expiry);

        await userRepository.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponse(user.Id, user.FirstName, user.Email, accessToken, refreshToken);
    }
}
