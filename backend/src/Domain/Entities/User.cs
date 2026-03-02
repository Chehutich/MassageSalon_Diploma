using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class User : IAuditableEntity
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string FirstName { get; private set; } = null!;

    public string LastName { get; private set; } = null!;

    public string? Phone { get; private set; }

    public string Email { get; private set; } = null!;

    public string PasswordHash { get; private set; } = null!;

    public Role Role { get; private set; } = Role.Client;

    public string? RefreshToken { get; private set; }

    public DateTime? RefreshTokenExpiry { get; private set; }

    public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();

    public virtual ICollection<Master> Masters { get; private set; } = new List<Master>();

    private User() { }

    public User(string firstName, string lastName, string email, string passwordHash, string phone)
    {
        if (string.IsNullOrWhiteSpace(firstName))
        {
            throw new ArgumentException("First name cannot be empty.");
        }

        if (string.IsNullOrWhiteSpace(lastName))
        {
            throw new ArgumentException("Last name cannot be empty.");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email cannot be empty.");
        }

        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new ArgumentException("Password hash cannot be empty.");
        }

        if (string.IsNullOrWhiteSpace(phone))
        {
            throw new ArgumentException("Phone number cannot be empty.");
        }

        FirstName = firstName;
        LastName = lastName;
        Email = email.ToLowerInvariant();
        PasswordHash = passwordHash;
        Phone = phone;
    }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public void ChangeRole(Role newRole)
    {
        Role = newRole;
    }

    public void SetRefreshToken(string token, DateTime expiry)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new ArgumentException("Token cannot be empty.");
        }

        if (expiry <= DateTime.UtcNow)
        {
            throw new ArgumentException("Expiry date must be in the future.");
        }

        RefreshToken = token;
        RefreshTokenExpiry = expiry;
    }

    public void InvalidateRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiry = DateTime.MinValue;
    }

    public void UpdatePassword(string newHash)
    {
        if (string.IsNullOrWhiteSpace(newHash))
        {
            throw new ArgumentException("New password hash cannot be empty.");
        }

        PasswordHash = newHash;
    }
}
