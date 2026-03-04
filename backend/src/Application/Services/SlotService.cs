using Application.Common.Constants;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.Catalog.GetAvailableSlots;
using Domain.Entities;

namespace Application.Services;

public class SlotService(
    IMasterRepository masterRepository,
    IServiceRepository serviceRepository,
    IAppointmentRepository appointmentRepository,
    TimeProvider timeProvider) : ISlotService
{
    private const int TimeStepMinutes = 30;

    public async Task<List<Slot>> GetAvailableSlotsAsync(Guid? masterId, Guid serviceId, DateTime date, CancellationToken cancellationToken = default)
    {
        var service = await serviceRepository.GetByIdAsync(serviceId, cancellationToken);
        if (service == null)
        {
            return new();
        }

        List<Master> masters;
        if (masterId.HasValue)
        {
            var master = await masterRepository.GetByIdAsync(masterId.Value, cancellationToken);
            masters = master != null ? [master] : [];
        }
        else
        {
            masters = await masterRepository.GetMastersByServiceAsync(serviceId, cancellationToken);
        }

        var tempResults = new List<(MasterSlotDto Master, Slot RawSlot)>();

        foreach (var master in masters)
        {
            var masterDto = new MasterSlotDto(
                master.Id,
                master.User.FirstName,
                master.User.LastName,
                master.PhotoUrl,
                master.Bio);

            var masterSlots = await GetSlotsForMasterAsync(master.Id, service.Duration, date, cancellationToken);

            foreach (var slot in masterSlots)
            {
                tempResults.Add((masterDto, slot));
            }
        }

        return tempResults
            .GroupBy(x => x.RawSlot.Start)
            .Select(g => new Slot(
                g.Key,
                g.First().RawSlot.End,
                g.Select(x => x.Master).ToList()
            ))
            .OrderBy(s => s.Start)
            .ToList();
    }

    private async Task<List<Slot>> GetSlotsForMasterAsync(
        Guid masterId,
        int durationMinutes,
        DateTime date,
        CancellationToken cancellationToken)
    {
        var schedule = await masterRepository.GetScheduleForDayAsync(masterId, (int)date.DayOfWeek, cancellationToken);
        if (schedule == null)
        {
            return new();
        }

        var hasTimeOff = await masterRepository.IsOnTimeOffAsync(masterId, date, cancellationToken);
        if (hasTimeOff)
        {
            return new();
        }

        var appointments = await appointmentRepository.GetByMasterAndDateAsync(masterId, date, cancellationToken);
        var now = timeProvider.GetUtcNow().UtcDateTime;

        // Minimum booking time: 1 hour
        var minAllowedBookingTime = now.AddHours(1);

        var slots = new List<Slot>();
        var currentStart = date.Date.Add(schedule.StartTime.ToTimeSpan());
        var dayEnd = date.Date.Add(schedule.EndTime.ToTimeSpan());

        while (currentStart.AddMinutes(durationMinutes) <= dayEnd)
        {
            var currentEnd = currentStart.AddMinutes(durationMinutes);

            bool isOverlapping = appointments.Any(a =>
                currentStart < a.EndTime && a.StartTime < currentEnd);

            if (!isOverlapping && currentStart >= minAllowedBookingTime)
            {
                slots.Add(new Slot(currentStart, currentEnd));
            }

            currentStart = currentStart.AddMinutes(TimeStepMinutes);
        }

        return slots;
    }
}
