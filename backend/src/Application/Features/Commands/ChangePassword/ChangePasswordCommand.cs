using Application.Common.Intefaces;
using Application.Common.Intefaces.Repos;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Commands.ChangePassword;

public record ChangePasswordCommand(string OldPassword, string NewPassword) : IRequest<Result<Unit, Error>>;

public class ChangePasswordHandler(
    IUserRepository userRepository,
    ICurrentUserContext userContext,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork) : IRequestHandler<ChangePasswordCommand, Result<Unit, Error>>
{
    public async Task<Result<Unit, Error>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(userContext.Id, cancellationToken);
        if (user is null)
        {
            return Errors.User.NotFound(userContext.Id);
        }

        if (!passwordHasher.VerifyPassword(request.OldPassword, user.PasswordHash))
        {
            return Errors.User.InvalidPassword;
        }

        var newPasswordHash = passwordHasher.HashPassword(request.NewPassword);

        user.UpdatePassword(newPasswordHash);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
