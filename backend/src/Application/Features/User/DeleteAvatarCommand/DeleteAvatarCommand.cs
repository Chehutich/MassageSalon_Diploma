using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.User.DeleteAvatarCommand;

public record DeleteAvatarCommand() : IRequest<Result<Unit, Error>>;

public class DeleteAvatarCommandHandler(
    ICurrentUserContext currentUserContext,
    IUserRepository userRepository,
    IFileStorageService fileStorageService,
    IUnitOfWork unitOfWork) : IRequestHandler<DeleteAvatarCommand, Result<Unit, Error>>
{
    public async Task<Result<Unit, Error>> Handle(DeleteAvatarCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(currentUserContext.Id, cancellationToken);
        if (user is null)
        {
            return Errors.User.NotFound(currentUserContext.Id);
        }

        if (!string.IsNullOrEmpty(user.PhotoUrl))
        {
            await fileStorageService.DeleteAsync(user.PhotoUrl, cancellationToken);
            user.SetPhotoUrl(null);

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }
}
