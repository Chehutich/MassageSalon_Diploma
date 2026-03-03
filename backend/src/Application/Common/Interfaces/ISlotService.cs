using Domain.ValueObjects;

namespace Application.Common.Interfaces;

public interface ISlotService
{
    Task<List<Slot>> GetAvailableSlotsAsync(
        Guid masterId,
        Guid serviceId,
        DateTime date,
        CancellationToken cancellationToken);
}
