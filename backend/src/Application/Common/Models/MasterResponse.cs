namespace Application.Common.Models;

public record MasterResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string? PhotoUrl,
    string? Bio,
    List<CategoryResponse> ServiceCategories
);
