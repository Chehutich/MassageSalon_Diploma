namespace Application.Common.Models;

public record MasterDetailsResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string? PhotoUrl,
    string? Bio,
    List<ServiceResponse> Services
);
