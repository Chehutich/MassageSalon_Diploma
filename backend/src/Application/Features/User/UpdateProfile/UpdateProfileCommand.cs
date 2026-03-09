using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.User.UpdateProfile;

public record UpdateProfileCommand(
    string? FirstName,
    string? LastName,
    string? Email,
    string? Phone,
    string? CurrentPassword,
    string? NewPassword,
    string? PhotoUrl
) : IRequest<Result<Unit, Error>>;

public class UpdateProfileCommandHandler(
    ICurrentUserContext currentUserContext,
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateProfileCommand, Result<Unit, Error>>
{
    public async Task<Result<Unit, Error>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUserContext.Id;
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return Errors.User.NotFound(currentUserContext.Id);
        }

        if (request.Email != null || request.NewPassword != null)
        {
            if (string.IsNullOrEmpty(request.CurrentPassword) ||
                !passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return Errors.User.InvalidPassword;
            }
        }

        if (request.FirstName != null)
        {
            user.SetFirstName(request.FirstName);
        }

        if (request.LastName != null)
        {
            user.SetLastName(request.LastName);
        }

        if (request.Email != null && request.Email != user.Email)
        {
            if (await userRepository.GetByEmailAsync(request.Email, cancellationToken) is not null)
            {
                return Errors.User.DuplicateEmail(request.Email);
            }

            // For future: send verification email
            user.SetEmail(request.Email);
        }

        if (request.NewPassword != null)
        {
            user.SetPassword(passwordHasher.HashPassword(request.NewPassword));
        }

        if (request.Phone != null && request.Phone != user.Phone)
        {
            if (await userRepository.GetByPhoneAsync(request.Phone, cancellationToken) is not null)
            {
                return Errors.User.DuplicatePhone(request.Phone);
            }

            user.SetPhone(request.Phone);
        }

        if (request.PhotoUrl != null)
        {
            user.SetPhotoUrl(request.PhotoUrl);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
