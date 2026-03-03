using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Domain.ValueObjects;

namespace Application.Services;

public class SlotService(
    IMasterRepository masterRepository,
    IServiceRepository serviceRepository,
    IAppointmentRepository appointmentRepository,
    TimeProvider timeProvider) : ISlotService
{
    private const int TimeStepMinutes = 30;

    public async Task<List<Slot>> GetAvailableSlotsAsync(Guid masterId, Guid serviceId, DateTime date, CancellationToken cancellationToken)
    {
        var service = await serviceRepository.GetByIdAsync(serviceId, cancellationToken);
        if (service == null)
        {
            return new();
        }

        var schedule = await masterRepository.GetScheduleForDayAsync(masterId, (int)date.DayOfWeek, cancellationToken);
        if (schedule == null)
        {
            return new();
        }

        var appointments = await appointmentRepository.GetByMasterAndDateAsync(masterId, date, cancellationToken);
        var hasTimeOff = await masterRepository.IsOnTimeOffAsync(masterId, date, cancellationToken);

        if (hasTimeOff)
        {
            return new();
        }

        // Generate available slots
        var availableSlots = new List<Slot>();
        var currentStart = date.Date.Add(schedule.StartTime.ToTimeSpan());
        var dayEnd = date.Date.Add(schedule.EndTime.ToTimeSpan());

        var now = timeProvider.GetUtcNow().UtcDateTime;

        // Minimum booking time: 1 hour
        var minAllowedBookingTime = now.AddHours(1);

        // Frequency: 30 minutes
        while (currentStart.AddMinutes(service.Duration) <= dayEnd)
        {
            var currentEnd = currentStart.AddMinutes(service.Duration);

            // Check if there's an overlapping appointment'
            bool isOverlapping = appointments.Any(a =>
                currentStart < a.EndTime && a.StartTime < currentEnd);

            if (!isOverlapping && currentStart >= minAllowedBookingTime)
            {
                availableSlots.Add(new Slot(currentStart, currentEnd));
            }
            currentStart = currentStart.AddMinutes(TimeStepMinutes);
        }

        return availableSlots;
    }
}
