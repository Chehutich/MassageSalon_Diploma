using Application.Common.Interfaces;

namespace Infrastructure.Authentication;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(hash) || !hash.StartsWith("$2", StringComparison.Ordinal))
            {
                return false;
            }

            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (Exception)
        {
            return false;
        }
    }
}
