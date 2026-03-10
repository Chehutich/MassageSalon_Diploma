using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.User.UploadAvatar;

public class UploadAvatarCommandValidator : AbstractValidator<UploadAvatarCommand>
{
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public UploadAvatarCommandValidator()
    {
        RuleFor(x => x.FileName)
            .NotEmpty().WithErrorCode(ValidationErrors.File.Empty)
            .Must(HaveAllowedExtension).WithErrorCode(ValidationErrors.File.InvalidFileType);

        RuleFor(x => x.FileStream)
            .NotNull().WithErrorCode(ValidationErrors.File.Empty)
            .Must(x => x.Length > 0).WithErrorCode(ValidationErrors.File.Empty)
            .Must(x => x.Length <= MaxFileSize).WithErrorCode(ValidationErrors.File.TooBig);
    }

    private bool HaveAllowedExtension(string fileName)
    {
        var extension = Path.GetExtension(fileName)?.ToLower();
        return extension != null && _allowedExtensions.Contains(extension);
    }
}
