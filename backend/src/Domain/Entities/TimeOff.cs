namespace Domain.Entities;

public class TimeOff
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid MasterId { get; private set; }

    public DateOnly StartDate { get; private set; }

    public DateOnly EndDate { get; private set; }

    public string? Reason { get; private set; }

    public virtual Master Master { get; private set; } = null!;

    private TimeOff() { }

    public TimeOff(Guid masterId, DateOnly startDate, DateOnly endDate, string? reason = null)
    {
        if (endDate < startDate)
        {
            throw new ArgumentException("End date must be after start date.");
        }

        MasterId = masterId;
        StartDate = startDate;
        EndDate = endDate;
        Reason = reason;
    }
}
