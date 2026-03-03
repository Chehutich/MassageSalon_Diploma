using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Commands.ChangePhone;

public record ChangePhoneCommand(string NewPhone, string Password) : IRequest<Result<Unit, Error>>;

public class ChangePhoneHandler(
    IUserRepository userRepository,
    ICurrentUserContext userContext,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork) : IRequestHandler<ChangePhoneCommand, Result<Unit, Error>>
{
    public async Task<Result<Unit, Error>> Handle(ChangePhoneCommand request, CancellationToken cancellationToken)
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

        var existingUser = await userRepository.GetByPhoneAsync(request.NewPhone, cancellationToken);
        if (existingUser is not null)
        {
            return Errors.User.DuplicatePhone(request.NewPhone);
        }

        user.UpdatePhone(request.NewPhone);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
