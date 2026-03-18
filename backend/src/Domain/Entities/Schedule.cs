namespace Domain.Entities;

public class Schedule
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid MasterId { get; private set; }

    public int DayOfWeek { get; private set; }

    public TimeOnly StartTime { get; private set; }

    public TimeOnly EndTime { get; private set; }

    public virtual Master Master { get; private set; } = null!;

    private Schedule() { }

    public Schedule(Guid masterId, int dayOfWeek, TimeOnly startTime, TimeOnly endTime)
    {
        if (endTime <= startTime)
        {
            throw new ArgumentException("End time must be after start time.");
        }

        if (dayOfWeek < 0 || dayOfWeek > 6)
        {
            throw new ArgumentOutOfRangeException(nameof(dayOfWeek),
                "Day of week must be between 0 and 6 (Monday to Sunday).");
        }

        MasterId = masterId;
        DayOfWeek = dayOfWeek;
        StartTime = startTime;
        EndTime = endTime;
    }
}
