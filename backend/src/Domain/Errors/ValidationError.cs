namespace Domain.Errors;

public sealed record ValidationError : Error
{
    public Dictionary<string, string[]> Errors { get; }

    public ValidationError(Dictionary<string, string[]> errors)
        : base("validation_error", "One or more validation failures occurred.")
    {
        Errors = errors;
    }
}
