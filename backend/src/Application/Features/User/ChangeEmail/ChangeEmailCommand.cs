using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.User.ChangeEmail;

public record ChangeEmailCommand(string NewEmail, string Password) : IRequest<Result<Unit, Error>>;

public class ChangeEmailHandler(
    IUserRepository userRepository,
    ICurrentUserContext userContext,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork) : IRequestHandler<ChangeEmailCommand, Result<Unit, Error>>
{
    public async Task<Result<Unit, Error>> Handle(ChangeEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(userContext.Id, cancellationToken);
        if (user is null)
        {
            return Errors.User.NotFound(userContext.Id);
        }

        if (!passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Errors.User.InvalidPassword;
        }

        var existingUser = await userRepository.GetByEmailAsync(request.NewEmail, cancellationToken);
        if (existingUser is not null)
        {
            return Errors.User.DuplicateEmail(request.NewEmail);
        }

        user.UpdateEmail(request.NewEmail);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
