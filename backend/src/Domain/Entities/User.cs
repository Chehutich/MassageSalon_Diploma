using System.Text.RegularExpressions;
using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class User : IAuditableEntity
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string FirstName { get; private set; } = null!;

    public string LastName { get; private set; } = null!;

    public string Phone { get; private set; }

    public string? Email { get; private set; }

    public string? PhotoUrl { get; private set; }

    public string? PasswordHash { get; private set; }

    public Role Role { get; private set; } = Role.Guest;

    public string? RefreshToken { get; private set; }

    public DateTime? RefreshTokenExpiry { get; private set; }

    public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();

    public virtual ICollection<Master> Masters { get; private set; } = new List<Master>();

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    private User() { }

    /// <summary>
    /// That constructor is used for creating any user(include guests) manually
    /// </summary>
    private User(string firstName, string lastName, string? email, string? passwordHash, string phone, Role role)
    {
        // Only validation
        SetFirstName(firstName);
        SetLastName(lastName);
        SetPhone(phone);

        if (email is not null)
        {
            SetEmail(email);
        }

        if (passwordHash is not null)
        {
            SetPassword(passwordHash);
        }

        Role = role;
    }

    public static User CreateGuest(string firstName, string lastName, string phone)
    {
        return new User(firstName, lastName, null, null, phone, Role.Guest);
    }

    public static User CreateRegistered(
        string firstName,
        string lastName,
        string email,
        string passwordHash,
        string phone)
    {
        return new User(firstName, lastName, email, passwordHash, phone, Role.Client);
    }

    public void UpgradeGuestToRegistered(string firstName, string lastName, string email, string passwordHash)
    {
        SetFirstName(firstName);
        SetLastName(lastName);
        SetEmail(email);
        SetPassword(passwordHash);

        Role = Role.Client;
    }

    public void SetFirstName(string firstName)
    {
        if (string.IsNullOrWhiteSpace(firstName))
        {
            throw new ArgumentException("First name cannot be empty.");
        }

        if (!RegexHelper.NameRegex().IsMatch(firstName))
        {
            throw new ArgumentException("First name contains invalid characters or is too short.");
        }

        FirstName = firstName;
    }

    public void SetLastName(string lastName)
    {
        if (string.IsNullOrWhiteSpace(lastName))
        {
            throw new ArgumentException("Last name cannot be empty.");
        }

        if (!RegexHelper.NameRegex().IsMatch(lastName))
        {
            throw new ArgumentException("Last name contains invalid characters or is too short.");
        }

        LastName = lastName;
    }

    public void SetPhotoUrl(string? photoUrl)
    {
        if (!string.IsNullOrEmpty(photoUrl) &&
            (!Uri.TryCreate(photoUrl, UriKind.Absolute, out var uri) ||
             (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)))
        {
            throw new ArgumentException($"Invalid URL: {photoUrl}");
        }

        PhotoUrl = photoUrl;
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

    public void SetEmail(string newEmail)
    {
        if (string.IsNullOrWhiteSpace(newEmail))
        {
            throw new ArgumentException("New email cannot be empty.");
        }

        if (!RegexHelper.EmailRegex().IsMatch(newEmail))
        {
            throw new ArgumentException("Invalid email format.");
        }

        Email = newEmail.ToLowerInvariant();
        InvalidateRefreshToken();
    }

    public void SetPassword(string newHash)
    {
        if (string.IsNullOrWhiteSpace(newHash))
        {
            throw new ArgumentException("New password hash cannot be empty.");
        }

        PasswordHash = newHash;
        InvalidateRefreshToken();
    }

    public void SetPhone(string newPhone)
    {
        if (string.IsNullOrWhiteSpace(newPhone))
        {
            throw new ArgumentException("New phone number cannot be empty.");
        }

        if (!RegexHelper.PhoneRegex().IsMatch(newPhone))
        {
            throw new ArgumentException("Invalid phone number format.");
        }

        Phone = newPhone;
        InvalidateRefreshToken();
    }
}
