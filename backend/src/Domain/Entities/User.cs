using System.Text.RegularExpressions;
using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public partial class User : IAuditableEntity
{
    [GeneratedRegex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")]
    private static partial Regex EmailRegex();

    [GeneratedRegex(@"^\+?[1-9]\d{1,14}$")]
    private static partial Regex PhoneRegex();

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

        if (!EmailRegex().IsMatch(email))
        {
            throw new ArgumentException("Invalid email format.");
        }

        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new ArgumentException("Password hash cannot be empty.");
        }

        if (string.IsNullOrWhiteSpace(phone))
        {
            throw new ArgumentException("Phone number cannot be empty.");
        }

        if (!PhoneRegex().IsMatch(phone))
        {
            throw new ArgumentException("Invalid phone number format. Use international format (e.g. +380...)");
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
        RefreshTokenExpiry = null;
    }

    public void UpdateEmail(string newEmail)
    {
        if (string.IsNullOrWhiteSpace(newEmail))
        {
            throw new ArgumentException("New email cannot be empty.");
        }

        if (!EmailRegex().IsMatch(newEmail))
        {
            throw new ArgumentException("Invalid email format.");
        }

        Email = newEmail.ToLowerInvariant();
        InvalidateRefreshToken();
    }

    public void UpdatePassword(string newHash)
    {
        if (string.IsNullOrWhiteSpace(newHash))
        {
            throw new ArgumentException("New password hash cannot be empty.");
        }

        PasswordHash = newHash;
        InvalidateRefreshToken();
    }

    public void UpdatePhone(string newPhone)
    {
        if (string.IsNullOrWhiteSpace(newPhone))
        {
            throw new ArgumentException("New phone number cannot be empty.");
        }

        if (!PhoneRegex().IsMatch(newPhone))
        {
            throw new ArgumentException("Invalid phone number format.");
        }

        Phone = newPhone;
        InvalidateRefreshToken();
    }
}
