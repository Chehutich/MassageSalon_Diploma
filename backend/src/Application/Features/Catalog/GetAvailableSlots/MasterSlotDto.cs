namespace Application.Features.Catalog.GetAvailableSlots;

public record MasterSlotDto(
    Guid Id,
    string FirstName,
    string LastName,
    string? PhotoUrl,
    string? Bio);
