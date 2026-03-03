using Application.Common.Intefaces;
using Application.Common.Intefaces.Repos;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Commands.Logout;

public record LogoutCommand : IRequest<Result<Unit, Error>>;

public class LogoutHandler(
    IUserRepository userRepository,
    ICurrentUserContext userContext,
    IUnitOfWork unitOfWork) : IRequestHandler<LogoutCommand, Result<Unit, Error>>
{
    public async Task<Result<Unit, Error>> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var userId = userContext.Id;
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
        {
            return Errors.User.NotFound(userId);
        }

        user.InvalidateRefreshToken();

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
