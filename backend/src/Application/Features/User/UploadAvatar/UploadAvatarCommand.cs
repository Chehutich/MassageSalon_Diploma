using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.User.UploadAvatar;

public record UploadAvatarCommand(Stream FileStream, string FileName) : IRequest<Result<string, Error>>;

public class UploadAvatarCommandHandler(
    ICurrentUserContext currentUserContext,
    IUserRepository userRepository,
    IFileStorageService fileStorageService,
    IUnitOfWork unitOfWork) : IRequestHandler<UploadAvatarCommand, Result<string, Error>>
{
    public async Task<Result<string, Error>> Handle(UploadAvatarCommand request, CancellationToken cancellationToken)
    {
        if (request.FileStream == null || request.FileStream.Length == 0)
        {
            return Errors.File.EmptyFile;
        }

        var user = await userRepository.GetByIdAsync(currentUserContext.Id, cancellationToken);
        if (user is null)
        {
            return Errors.User.NotFound(currentUserContext.Id);
        }

        if (!string.IsNullOrEmpty(user.PhotoUrl))
        {
            await fileStorageService.DeleteAsync(user.PhotoUrl, cancellationToken);
        }

        var newPhotoUrl = await fileStorageService.UploadAsync(request.FileStream, request.FileName, cancellationToken);

        user.SetPhotoUrl(newPhotoUrl);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success<string, Error>(newPhotoUrl);
    }
}
