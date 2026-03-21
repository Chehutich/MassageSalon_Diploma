namespace Application.Common.Models;

public record MasterWorkingHoursResponse(
    DateTime Date,           // Just Date
    DateTime? StartTimeUtc,  // Full Date
    DateTime? EndTimeUtc,
    bool IsWorkingDay,
    string? Type             // 'Regular', 'Off', 'Holiday'
);
