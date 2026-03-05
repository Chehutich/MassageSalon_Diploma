namespace Application.Features.Appointments.GetAppointmentDetails;

public record AppointmentDetailsDto(
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
    string MasterFirstName,
    string MasterLastName,
    string? MasterPhotoUrl
);
