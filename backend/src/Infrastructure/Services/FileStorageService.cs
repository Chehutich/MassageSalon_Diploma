using Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services;

public class FileStorageService(
    IWebHostEnvironment env,
    IHttpContextAccessor httpContextAccessor) : IFileStorageService
{
    private const string UploadsFolderName = "uploads";

    public async Task<string> UploadAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        var uploadsPath = Path.Combine(env.WebRootPath, UploadsFolderName);

        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var filePath = Path.Combine(uploadsPath, uniqueName);

        await using var output = new FileStream(filePath, FileMode.Create);
        await fileStream.CopyToAsync(output, cancellationToken);

        var request = httpContextAccessor.HttpContext?.Request;
        var baseUrl = $"{request?.Scheme}://{request?.Host}";

        return $"{baseUrl}/{UploadsFolderName}/{uniqueName}";
    }

    public Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(fileUrl))
        {
            return Task.CompletedTask;
        }

        try
        {
            var fileName = Path.GetFileName(fileUrl);
            var filePath = Path.Combine(env.WebRootPath, UploadsFolderName, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        catch
        {
        }

        return Task.CompletedTask;
    }
}
