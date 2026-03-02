namespace Domain.Entities;

public class Master
{
    public Guid Id { get; private set; }

    public Guid UserId { get; private set; }

    public string? Bio { get; private set; }

    public string? PhotoUrl { get; private set; }

    public bool IsActive { get; private set; }

    public DateTime UpdatedAt { get; private set; }

    public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();

    public virtual ICollection<Schedule> Schedules { get; private set; } = new List<Schedule>();

    public virtual ICollection<TimeOff> TimeOffs { get; private set; } = new List<TimeOff>();

    public virtual User User { get; private set; } = null!;

    public virtual ICollection<Service> Services { get; private set; } = new List<Service>();
}
