namespace Application.Common.Models;

public record AppointmentDetailsResponse(
    Guid Id,
    DateTime StartTime,
    DateTime EndTime,
    string Status,
    string? ClientNotes,
    // Service
    Guid ServiceId,
    string ServiceName,
    decimal Price,
    int Duration,
    // Master
    Guid MasterId,
    Guid MasterUserId,
    string MasterFirstName,
    string MasterLastName,
    string? MasterPhotoUrl,
    // Client
    Guid ClientId,
    string ClientFirstName,
    string ClientLastName,
    string ClientPhone,
    string? ClientEmail,
    string? ClientPhotoUrl
);
