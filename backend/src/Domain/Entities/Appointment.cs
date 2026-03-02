using Domain.Common;

namespace Domain.Entities;

public class Appointment : IAuditableEntity
{
    public Guid Id { get; private set; }

    public Guid ClientId { get; private set; }

    public Guid MasterId { get; private set; }

    public Guid ServiceId { get; private set; }

    public DateTime StartTime { get; private set; }

    public DateTime EndTime { get; private set; }

    public string Status { get; private set; } = null!;

    public decimal ActualPrice { get; private set; }

    public string? ClientNotes { get; private set; }

    public virtual User Client { get; private set; } = null!;

    public virtual Master Master { get; private set; } = null!;

    public virtual Service Service { get; private set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
