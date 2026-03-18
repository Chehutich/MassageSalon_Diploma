using Domain.Enums;
using Infrastructure.Persistence.Repos;
using Xunit;

namespace InfrastructureTests.Repos;

public class AppointmentRepositoryTests : BaseRepositoryTest
{
    private readonly AppointmentRepository _repository;

    public AppointmentRepositoryTests()
    {
        _repository = new AppointmentRepository(context);
    }

    [Fact]
    public async Task GetBusyIntervalsAsync_ShouldReturnCombinedAndSortedIntervals()
    {
        // Arrange
        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id);

        var now = DateTime.UtcNow;
        var startRange = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc).AddDays(1);
        var endRange = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc).AddDays(5);

        // 1. Valid Appointment within range
        await CreateAppointmentAsync(master.Id, service, startRange.AddHours(10));

        // 2. Cancelled Appointment (should be ignored)
        var cancelledAppt = await CreateAppointmentAsync(master.Id, service, startRange.AddHours(14));
        cancelledAppt.Cancel();
        await context.SaveChangesAsync();

        // 3. TimeOff within range
        await CreateTimeOffAsync(master.Id,
            DateOnly.FromDateTime(startRange.AddDays(2)),
            DateOnly.FromDateTime(startRange.AddDays(2)));

        // 4. Appointment for DIFFERENT master (should be ignored)
        var otherMaster = await CreateMasterAsync();
        await CreateAppointmentAsync(otherMaster.Id, service, startRange.AddHours(11));

        // Act
        var result = await _repository.GetBusyIntervalsAsync(master.Id, startRange, endRange);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);

        // Verify Sorting: Earliest first
        Assert.True(result[0].Start < result[1].Start);

        // Verify types are present (1 appt, 1 timeoff)
        Assert.Contains(result, i => i.Start == startRange.AddHours(10)); // The appointment
        Assert.Contains(result, i => i.Start.Date == startRange.AddDays(2).Date); // The TimeOff
    }

    [Fact]
    public async Task GetBusyIntervalsAsync_ShouldFilterByBoundaryDates()
    {
        // Arrange
        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id);

        var now = DateTime.UtcNow;
        var startRange = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);
        var endRange = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc).AddMonths(1).AddDays(1);

        // Appointment strictly BEFORE range
        await CreateAppointmentAsync(master.Id, service, startRange.AddHours(-5));

        // Appointment strictly AFTER range
        await CreateAppointmentAsync(master.Id, service, endRange.AddHours(5));

        // Appointment overlapping START of range
        // Starts at 23:00 day before, ends at 01:00
        await CreateAppointmentAsync(master.Id, service, startRange.AddMinutes(-30));

        // Act
        var result = await _repository.GetBusyIntervalsAsync(master.Id, startRange, endRange);

        // Assert
        // Only the overlapping one should be returned
        Assert.Single(result);
    }

    [Fact]
    public async Task GetBusyIntervalsAsync_WhenTimeOffExists_ShouldMapToFullDayInterval()
    {
        // Arrange
        var master = await CreateMasterAsync();
        // Use future dates (+2 months ahead) to guarantee they are never in the past.
        var baseDate  = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(2);
        var startDate = DateOnly.FromDateTime(baseDate.AddDays(19)); // 20th of that month
        var endDate   = DateOnly.FromDateTime(baseDate.AddDays(20)); // 21st of that month

        await CreateTimeOffAsync(master.Id, startDate, endDate);

        // Search window covers the whole month
        var searchStart = baseDate;
        var searchEnd   = baseDate.AddMonths(1);

        // Act
        var result = await _repository.GetBusyIntervalsAsync(master.Id, searchStart, searchEnd);

        // Assert
        var interval = Assert.Single(result);

        // TimeOffs are mapped to MinValue (00:00:00) and MaxValue (23:59:59.999)
        Assert.Equal(TimeOnly.MinValue.Hour, interval.Start.Hour);
        Assert.Equal(startDate.Day, interval.Start.Day);

        Assert.Equal(endDate.Day, interval.End.Day);
        Assert.Equal(23, interval.End.Hour);
    }

    [Fact]
    public async Task GetBusyIntervalsAsync_DynamicNextMonthScenario_ShouldReturnCorrectDataForTargetMaster()
    {
        // --- Arrange ---
        // Calculate the start and end of the NEXT month dynamically
        var now = DateTime.UtcNow;
        var nextMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);
        var nextMonthEnd = nextMonthStart.AddMonths(1).AddTicks(-1);

        // Setup: 3 Masters
        var targetMaster = await CreateMasterAsync();
        var otherMaster1 = await CreateMasterAsync();
        var otherMaster2 = await CreateMasterAsync();

        // Setup: Services with different durations
        var category = await CreateCategoryAsync("Maintenance", "maint");
        var quickService = await CreateServiceAsync(category.Id, "Quick Fix", 30); // 30 min
        var longService = await CreateServiceAsync(category.Id, "Full Overhaul", 180); // 3 hours

        // 1. TARGET MASTER: Appointment on the first Monday of the next month
        var firstMonday = GetNextDayOfWeek(nextMonthStart, DayOfWeek.Monday);
        await CreateAppointmentAsync(targetMaster.Id, quickService, firstMonday.AddHours(10));

        // 2. TARGET MASTER: Long Appointment on the first Wednesday
        var firstWednesday = GetNextDayOfWeek(nextMonthStart, DayOfWeek.Wednesday);
        await CreateAppointmentAsync(targetMaster.Id, longService, firstWednesday.AddHours(14));

        // 3. TARGET MASTER: TimeOff spanning the second weekend (Friday to Sunday)
        var secondFriday = GetNextDayOfWeek(nextMonthStart, DayOfWeek.Friday).AddDays(7);
        var secondSunday = secondFriday.AddDays(2);
        await CreateTimeOffAsync(targetMaster.Id,
            DateOnly.FromDateTime(secondFriday),
            DateOnly.FromDateTime(secondSunday));

        // 4. TARGET MASTER: Cancelled Appointment (should NOT appear)
        var cancelledTime = firstMonday.AddHours(15);
        var cancelled = await CreateAppointmentAsync(targetMaster.Id, quickService, cancelledTime);
        cancelled.Cancel();
        await context.SaveChangesAsync();

        // 5. NOISE: Other masters having appointments at the same time
        await CreateAppointmentAsync(otherMaster1.Id, longService, firstMonday.AddHours(10));
        await CreateAppointmentAsync(otherMaster2.Id, quickService, firstWednesday.AddHours(14));

        // --- Act ---
        var result = await _repository.GetBusyIntervalsAsync(targetMaster.Id, nextMonthStart, nextMonthEnd);

        // --- Assert ---
        // Expected: 2 Appointments + 1 TimeOff = 3 intervals
        Assert.Equal(3, result.Count);

        // 1. Verify the Quick Service Appointment (30 min)
        var quickInterval = result.FirstOrDefault(i => i.Start == firstMonday.AddHours(10));
        Assert.NotNull(quickInterval);
        Assert.Equal(30, (quickInterval.End - quickInterval.Start).TotalMinutes);

        // 2. Verify the Long Service Appointment (180 min)
        var longInterval = result.FirstOrDefault(i => i.Start == firstWednesday.AddHours(14));
        Assert.NotNull(longInterval);
        Assert.Equal(180, (longInterval.End - longInterval.Start).TotalMinutes);

        // 3. Verify the TimeOff
        var timeOffInterval = result.FirstOrDefault(i => i.Start.Date == secondFriday.Date);
        Assert.NotNull(timeOffInterval);
        Assert.Equal(secondSunday.Day, timeOffInterval.End.Day);

        // 4. Verify Global Sorting (Still important to check!)
        for (int i = 0; i < result.Count - 1; i++)
        {
            Assert.True(result[i].Start <= result[i + 1].Start,
                $"Interval at index {i} starts after interval at index {i+1}");
        }
    }

    /// <summary>
    /// Helper to find the specific day of the week within the target month
    /// </summary>
    private DateTime GetNextDayOfWeek(DateTime start, DayOfWeek day)
    {
        int daysToAdd = ((int)day - (int)start.DayOfWeek + 7) % 7;
        return start.AddDays(daysToAdd);
    }


    [Fact]
    public async Task GetBusyIntervalsAsync_WithNoData_ShouldReturnEmptyList()
    {
        // Arrange
        var masterId = Guid.NewGuid();
        var start = DateTime.UtcNow;
        var end = start.AddDays(1);

        // Act
        var result = await _repository.GetBusyIntervalsAsync(masterId, start, end);

        // Assert
        Assert.Empty(result);
    }
}
