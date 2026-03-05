using Application.Common.Models;
using Application.Features.Catalog.GetAvailableSlots;

namespace Application.Common.Interfaces;

public interface ISlotService
{
    Task<List<SlotResponse>> GetAvailableSlotsAsync(
        Guid? masterId,
        Guid serviceId,
        DateTime date,
        CancellationToken cancellationToken = default);
}
