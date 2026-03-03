using Domain.Entities;

namespace Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    public string GenerateToken(User user);

    public (string refreshToken, DateTime expiry) GenerateRefreshToken();

    Guid? GetUserIdFromExpiredToken(string token);
}
