namespace Domain.Entities;

public class TimeOff
{
    public Guid Id { get; private set; }

    public Guid MasterId { get; private set; }

    public DateOnly StartDate { get; private set; }

    public DateOnly EndDate { get; private set; }

    public string? Reason { get; private set; }

    public virtual Master Master { get; private set; } = null!;
}
