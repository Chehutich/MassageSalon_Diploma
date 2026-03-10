using Application.Common.Interfaces;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.User.UploadAvatar;

public record UploadAvatarCommand(Stream FileStream, string FileName) : IRequest<Result<string, Error>>;

public class UploadAvatarCommandHandler(
    IFileStorageService fileStorageService) : IRequestHandler<UploadAvatarCommand, Result<string, Error>>
{
    public async Task<Result<string, Error>> Handle(UploadAvatarCommand request, CancellationToken cancellationToken)
    {
        if (request.FileStream == null || request.FileStream.Length == 0)
        {
            return Errors.File.EmptyFile;
        }

        var fileUrl = await fileStorageService.UploadAsync(request.FileStream, request.FileName, cancellationToken);

        return Result.Success<string, Error>(fileUrl);
    }
}

