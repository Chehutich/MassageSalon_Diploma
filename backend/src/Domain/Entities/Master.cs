namespace Domain.Entities;

public class Master
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid UserId { get; private set; }

    public string? Bio { get; private set; }

    public bool IsActive { get; private set; } = true;

    public DateTime UpdatedAt { get; private set; }

    public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();

    public virtual ICollection<Schedule> Schedules { get; private set; } = new List<Schedule>();

    public virtual ICollection<TimeOff> TimeOffs { get; private set; } = new List<TimeOff>();

    public virtual User User { get; private set; } = null!;

    public virtual ICollection<Service> Services { get; private set; } = new List<Service>();

    private Master() { }

    public Master(Guid userId, string? bio)
    {
        UserId = userId;
        Bio = bio;
    }

    public void UpdateServices(IEnumerable<Service> services)
    {
        Services.Clear();
        foreach (var service in services)
        {
            Services.Add(service);
        }

        UpdatedAt = DateTime.UtcNow;
    }
}
