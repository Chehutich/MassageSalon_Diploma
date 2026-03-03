using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class Appointment : IAuditableEntity
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid ClientId { get; private set; }

    public Guid MasterId { get; private set; }

    public Guid ServiceId { get; private set; }

    public DateTime StartTime { get; private set; }

    public DateTime EndTime { get; private set; }

    public AppointmentStatus Status { get; private set; } = AppointmentStatus.Confirmed;

    public decimal ActualPrice { get; private set; }

    public string? ClientNotes { get; private set; }

    public virtual User Client { get; private set; } = null!;

    public virtual Master Master { get; private set; } = null!;

    public virtual Service Service { get; private set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    private Appointment() { }

    public Appointment(
        Guid clientId,
        Guid masterId,
        Service service,
        DateTime startTime,
        string? clientNotes)
    {
        if (startTime < DateTime.UtcNow)
        {
            throw new ArgumentException("Start time must be in the future.");
        }

        ClientId = clientId;
        MasterId = masterId;
        ServiceId = service.Id;
        StartTime = startTime;

        EndTime = startTime.AddMinutes(service.Duration);
        ActualPrice = service.Price;
        ClientNotes = clientNotes;
    }

    public void Cancel()
    {
        if (StartTime < DateTime.UtcNow.AddHours(1))
        {
            throw new InvalidOperationException("Cannot cancel an appointment within the next hour.");
        }

        Status = AppointmentStatus.Cancelled;
    }
}
