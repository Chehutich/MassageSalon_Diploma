namespace Domain.Entities;

public class Schedule
{
    public Guid Id { get; private set; }

    public Guid MasterId { get; private set; }

    public short DayOfWeek { get; private set; }

    public TimeOnly StartTime { get; private set; }

    public TimeOnly EndTime { get; private set; }

    public virtual Master Master { get; private set; } = null!;
}
