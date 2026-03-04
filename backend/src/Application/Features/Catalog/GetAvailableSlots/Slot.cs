using Domain.Entities;

namespace Application.Features.Catalog.GetAvailableSlots;

public record Slot(DateTime Start, DateTime End, List<MasterSlotDto>? AvailableMasters = null);
