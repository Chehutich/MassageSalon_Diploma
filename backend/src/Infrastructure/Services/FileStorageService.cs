using Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly string _uploadsPath;
    private readonly string _publicBaseUrl;

    public FileStorageService(IWebHostEnvironment env, IConfiguration config, IHttpContextAccessor accessor)
    {
        _uploadsPath = config["FileStorage:Path"]
                       ?? Path.Combine(env.ContentRootPath!, "AppData", "uploads");
        Directory.CreateDirectory(_uploadsPath);

        _publicBaseUrl = config["AppUrl"]
                         ?? "http://localhost:5260";
    }

    private const string UploadsFolderName = "uploads";

    public async Task<string> UploadAsync(
        Stream fileStream,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var filePath = Path.Combine(_uploadsPath, uniqueName);

        await using var output = new FileStream(filePath, FileMode.Create);
        await fileStream.CopyToAsync(output, cancellationToken);

        return $"{_publicBaseUrl.TrimEnd('/')}/uploads/{uniqueName}";
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
            var filePath = Path.Combine(_uploadsPath, fileName);

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
