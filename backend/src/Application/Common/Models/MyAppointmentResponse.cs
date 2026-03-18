namespace Application.Common.Models;

public record MyAppointmentResponse(
    Guid Id,
    DateTime StartTime,
    DateTime EndTime,
    Guid ServiceId,
    string ServiceName,
    Guid MasterId,
    string MasterFirstName,
    string MasterLastName,
    string Status,
    string? ClientNotes,
    decimal ActualPrice);
