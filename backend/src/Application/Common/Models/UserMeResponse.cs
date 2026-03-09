namespace Application.Common.Models;

public record UserMeResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhotoUrl,
    string Phone,
    string Role);
