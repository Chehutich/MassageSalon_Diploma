namespace Application.Common.Models;

public record SlotResponse(DateTime Start, DateTime End, List<MasterShortResponse>? AvailableMasters = null);
