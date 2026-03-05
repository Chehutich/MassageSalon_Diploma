namespace Application.Features.Appointments.GetMyAppointments;

public record MyAppointmentDto(
    Guid Id,
    DateTime StartTime,
    DateTime EndTime,

    Guid ServiceId,
    string ServiceName,

    Guid MasterId,
    string MasterFirstName,
    string MasterLastName,
    string Status,
    string? ClientNotes);
