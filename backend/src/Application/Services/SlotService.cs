using Application.Common.Constants;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using Application.Features.Catalog.GetAvailableSlots;
using Domain.Common;
using Domain.Entities;

namespace Application.Services;

public class SlotService(
    IMasterRepository masterRepository,
    IServiceRepository serviceRepository,
    IAppointmentRepository appointmentRepository,
    TimeProvider timeProvider) : ISlotService
{
    private const int TimeStepMinutes = 30;

    public async Task<List<SlotResponse>> GetAvailableSlotsAsync(Guid? masterId,
        Guid serviceId,
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        var service = await serviceRepository.GetByIdAsync(serviceId, cancellationToken);
        if (service == null)
        {
            return new();
        }

        var masters = await masterRepository.GetAllWithDetailsAsync(serviceId, cancellationToken) ?? new List<Master>();

        if (masterId.HasValue)
        {
            masters = masters.Where(m => m.Id == masterId.Value).ToList();

            if (masters.Count == 0)
            {
                return new();
            }
        }

        var tempResults = new List<(MasterShortResponse Master, SlotResponse RawSlot)>();

        foreach (var master in masters)
        {
            var masterDto = new MasterShortResponse(
                master.Id,
                master.User.FirstName,
                master.User.LastName,
                master.PhotoUrl);

            var masterSlots = await GetSlotsForMasterAsync(master.Id, service.Duration, date, cancellationToken);

            foreach (var slot in masterSlots)
            {
                tempResults.Add((masterDto, slot));
            }
        }

        return tempResults
            .GroupBy(x => x.RawSlot.Start)
            .Select(g => new SlotResponse(
                g.Key,
                g.First().RawSlot.End,
                g.Select(x => x.Master).ToList()
            ))
            .OrderBy(s => s.Start)
            .ToList();
    }

    public async Task<List<DateOnly>> GetAvailableDatesAsync(Guid serviceId,
        Guid? masterId,
        int year,
        int month,
        CancellationToken cancellationToken = default)
    {
        var service = await serviceRepository.GetByIdAsync(serviceId, cancellationToken);
        if (service == null)
        {
            return [];
        }

        var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = startDate.AddMonths(1);
        var nowUtc = timeProvider.GetUtcNow().UtcDateTime;

        var masters = await masterRepository.GetAllWithDetailsAsync(serviceId, cancellationToken);
        if (masterId.HasValue)
        {
            masters = masters.Where(m => m.Id == masterId.Value).ToList();
        }

        if (masters.Count == 0)
        {
            return [];
        }

        // Get busy intervals and schedules for all masters
        var masterData = new List<(Guid Id, List<BusyInterval> Busy, List<Schedule> Schedules)>();
        foreach (var m in masters)
        {
            var busy = await appointmentRepository.GetBusyIntervalsAsync(m.Id, startDate, endDate, cancellationToken);
            var schedules = await masterRepository.GetSchedulesForMasterAsync(m.Id, cancellationToken);
            masterData.Add((m.Id, busy, schedules));
        }

        var result = new List<DateOnly>();

        for (int day = 1; day <= DateTime.DaysInMonth(year, month); day++)
        {
            var currentDate = new DateOnly(year, month, day);
            if (currentDate < DateOnly.FromDateTime(nowUtc))
            {
                continue;
            }

            // Day is free if any master has a free slot for this day
            bool isAnyAvailable = false;
            foreach (var data in masterData)
            {
                var schedule = data.Schedules.FirstOrDefault(s => s.DayOfWeek == (int)currentDate.DayOfWeek);
                if (schedule == null)
                {
                    continue;
                }

                // Check if the day has a free slot for this service
                if (CheckIfDayHasFreeSlot(currentDate, schedule, data.Busy, service.Duration, nowUtc))
                {
                    isAnyAvailable = true;
                    break;
                }
            }

            if (isAnyAvailable)
            {
                result.Add(currentDate);
            }
        }

        return result;
    }

    private bool CheckIfDayHasFreeSlot(DateOnly date,
        Schedule schedule,
        List<BusyInterval> busy,
        int duration,
        DateTime nowUtc)
    {
        var currentStart = date.ToDateTime(schedule.StartTime, DateTimeKind.Utc);
        var dayEnd = date.ToDateTime(schedule.EndTime, DateTimeKind.Utc);
        var minAllowed = nowUtc.AddHours(1);

        while (currentStart.AddMinutes(duration) <= dayEnd)
        {
            var currentEnd = currentStart.AddMinutes(duration);

            if (currentStart >= minAllowed &&
                !busy.Any(b => currentStart < b.End && b.Start < currentEnd))
            {
                return true;
            }

            currentStart = currentStart.AddMinutes(30);
        }

        return false;
    }


    private async Task<List<SlotResponse>> GetSlotsForMasterAsync(Guid masterId,
        int durationMinutes,
        DateTime date,
        CancellationToken cancellationToken = default)
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

        var slots = new List<SlotResponse>();

        var dayDateUtc = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        var currentStart = dayDateUtc.Add(schedule.StartTime.ToTimeSpan());
        var dayEnd = dayDateUtc.Add(schedule.EndTime.ToTimeSpan());

        while (currentStart.AddMinutes(durationMinutes) <= dayEnd)
        {
            var currentEnd = currentStart.AddMinutes(durationMinutes);

            bool isOverlapping = appointments.Any(a =>
                currentStart < a.EndTime && a.StartTime < currentEnd);

            if (!isOverlapping && currentStart >= minAllowedBookingTime)
            {
                slots.Add(new SlotResponse(currentStart, currentEnd));
            }

            currentStart = currentStart.AddMinutes(TimeStepMinutes);
        }

        return slots;
    }
}
