using Application.Common.Models;
using Application.Features.Catalog.GetAvailableSlots;
using Domain.Common;

namespace Application.Common.Interfaces;

public interface ISlotService
{
    Task<List<SlotResponse>> GetAvailableSlotsAsync(
        Guid? masterId,
        Guid serviceId,
        DateTime dateTime,
        CancellationToken cancellationToken = default);

    Task<List<DateOnly>> GetAvailableDatesAsync(
        Guid serviceId,
        Guid? masterId,
        int year,
        int month,
        CancellationToken cancellationToken = default);

    Task<bool> IsMasterAvailableAsync(
        Guid masterId,
        DateTime startDate,
        DateTime endDate,
        Guid? excludeAppointmentId = null,
        CancellationToken cancellationToken = default);
}
