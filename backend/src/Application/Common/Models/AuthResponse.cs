namespace Application.Common.Models;

public record AuthResponse(Guid Id, string FirstName, string Email, string Token, string RefreshToken, string Role);
