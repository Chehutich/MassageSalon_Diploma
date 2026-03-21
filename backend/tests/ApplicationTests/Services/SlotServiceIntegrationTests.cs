using Application.Services;
using FluentAssertions;
using Infrastructure.Persistence.Repos;
using Microsoft.Extensions.Time.Testing;

namespace ApplicationTests.Services;

public class SlotServiceIntegrationTests : InfrastructureTests.Repos.BaseRepositoryTest
{
    private readonly SlotService _sut;
    private readonly FakeTimeProvider _timeProvider;

    // A future date (1st of next month + 1 day) used across all slot tests.
    // Keeping it in the future prevents the service from filtering it out as a past date.
    private static readonly DateTime FutureDate =
        new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc)
            .AddMonths(1)
            .AddDays(1); // +1 day ensures we never land on the 1st which could fall on a weekend edge-case

    public SlotServiceIntegrationTests()
    {
        var masterRepo = new MasterRepository(context);
        var scheduleRepo = new ScheduleRepository(context);
        var serviceRepo = new ServiceRepository(context);
        var timeOffRepo = new TimeOffRepository(context);
        var appointmentRepo = new AppointmentRepository(context);

        _timeProvider = new FakeTimeProvider();

        _sut = new SlotService(
            masterRepo,
            scheduleRepo,
            serviceRepo,
            timeOffRepo,
            appointmentRepo,
            _timeProvider);
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenServiceNotFound()
    {
        // Arrange
        var nonExistentServiceId = Guid.NewGuid();
        var someMasterId = Guid.NewGuid();
        var testDate = FutureDate;

        // Act
        var result = await _sut.GetAvailableSlotsAsync(someMasterId, nonExistentServiceId, testDate);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenMasterNotFound()
    {
        // Arrange
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Test Service", 60);

        var randomMasterId = Guid.NewGuid();
        var testDate = FutureDate;

        // Act
        var result = await _sut.GetAvailableSlotsAsync(randomMasterId, service.Id, testDate);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenMasterOnTimeOff()
    {
        // Arrange
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Haircut", 60);

        var master = await CreateMasterAsync();
        await LinkMasterToServiceAsync(master.Id, service.Id);

        var testDate = FutureDate;
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(18, 0));

        await CreateTimeOffAsync(master.Id, DateOnly.FromDateTime(testDate));

        // Act
        var result = await _sut.GetAvailableSlotsAsync(master.Id, service.Id, testDate);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenNoSchedule()
    {
        // Arrange
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Massage", 60);
        var master = await CreateMasterAsync();

        await LinkMasterToServiceAsync(master.Id, service.Id);

        var testDate = FutureDate;

        // Act
        var result = await _sut.GetAvailableSlotsAsync(master.Id, service.Id, testDate);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenNoMastersProvideService()
    {
        // Arrange
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Yoga", 60);

        var master = await CreateMasterAsync();

        var testDate = FutureDate;

        // Act
        var result = await _sut.GetAvailableSlotsAsync(null, service.Id, testDate);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnCorrectSlots_WhenNoAppointments()
    {
        // Arrange
        // Schedule 10:00-12:00, duration 60 min, step 30 min -> Fits 10:00, 10:30, 11:00
        var duration = 60;
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Haircut", duration);
        var master = await CreateMasterAsync();
        await LinkMasterToServiceAsync(master.Id, service.Id);

        var testDate = FutureDate;
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(12, 0));

        _timeProvider.SetUtcNow(testDate.AddHours(7));

        // Act
        var result = await _sut.GetAvailableSlotsAsync(master.Id, service.Id, testDate);

        // Assert
        result.Should().HaveCount(3);

        result[0].Start.Should().Be(testDate.AddHours(10));
        result[1].Start.Should().Be(testDate.AddHours(10).AddMinutes(30));
        result[2].Start.Should().Be(testDate.AddHours(11));

        result[0].End.Should().Be(testDate.AddHours(11));
        result[1].End.Should().Be(testDate.AddHours(11).AddMinutes(30));
        result[2].End.Should().Be(testDate.AddHours(12));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldSkipOverlappingSlots()
    {
        // Arrange
        // Schedule 10:00-13:00. Appointment at 10:30-11:30.
        // // 10:00, 10:30, 11:00 overlap. Free: 11:30, 12:00.
        var duration = 60;
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Haircut", duration);

        var master = await CreateMasterAsync();
        await LinkMasterToServiceAsync(master.Id, service.Id);

        var testDate = FutureDate;
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(13, 0));

        await CreateAppointmentAsync(master.Id, service, testDate.AddHours(10).AddMinutes(30));

        _timeProvider.SetUtcNow(testDate.AddHours(7));

        // Act
        var result = await _sut.GetAvailableSlotsAsync(master.Id, service.Id, testDate);

        result.Should().HaveCount(2);
        result[0].Start.Should().Be(testDate.AddHours(11).AddMinutes(30));
        result[1].Start.Should().Be(testDate.AddHours(12));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldHandleNonStandardDuration()
    {
        // Arrange
        // Duration 37 min. Appointment at 10:05-10:42.
        // 10:00(X), 10:30(X), 11:00(OK), 11:30(Out of bounds)
        var duration = 37;
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Precision Haircut", duration);

        var master = await CreateMasterAsync();
        await LinkMasterToServiceAsync(master.Id, service.Id);

        var testDate = FutureDate;
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(12, 0));

        await CreateAppointmentAsync(master.Id, service, testDate.AddHours(10).AddMinutes(5));

        _timeProvider.SetUtcNow(testDate.AddHours(7));

        // Act
        var result = await _sut.GetAvailableSlotsAsync(master.Id, service.Id, testDate);

        result.Should().ContainSingle();
        result[0].Start.Should().Be(testDate.AddHours(11));
        result[0].End.Should().Be(testDate.AddHours(11).AddMinutes(37));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldSkipSlotsBeforeMinBookingTime()
    {
        // Arrange
        // "Now" = 16:00. Min booking is +1 hour = 17:00.
        // Schedule 10:00-18:00. Duration 30 min. Only 17:00 and 17:30 should be available.
        var duration = 30;
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Quick Cut", duration);
        var master = await CreateMasterAsync();
        await LinkMasterToServiceAsync(master.Id, service.Id);

        var testDate = FutureDate;
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(18, 0));

        var now = testDate.AddHours(16);
        _timeProvider.SetUtcNow(now);

        // Act
        var result = await _sut.GetAvailableSlotsAsync(master.Id, service.Id, testDate);

        // Assert
        result.Should().HaveCount(2);
        result[0].Start.Should().Be(testDate.AddHours(17));
        result[1].Start.Should().Be(testDate.AddHours(17).AddMinutes(30));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldAggregateSlots_WhenMasterIdIsNull()
    {
        // Arrange
        // Master1: 10:00-11:00 (1 slot: 10:00)
        // Master2: 10:00-12:00 (3 slots: 10:00, 10:30, 11:00)
        var duration = 60;
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Consultation", duration);
        var testDate = FutureDate;

        var master1 = await CreateMasterAsync();
        await LinkMasterToServiceAsync(master1.Id, service.Id);
        await CreateScheduleAsync(master1.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(11, 0));

        var master2 = await CreateMasterAsync();
        await LinkMasterToServiceAsync(master2.Id, service.Id);
        await CreateScheduleAsync(master2.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(12, 0));

        _timeProvider.SetUtcNow(testDate.AddHours(7));

        // Act
        var result = await _sut.GetAvailableSlotsAsync(null, service.Id, testDate);

        // Assert
        result.Should().HaveCount(3);
        result.Should().BeInAscendingOrder(s => s.Start);

        var slot1000 = result.Single(s => s.Start == testDate.AddHours(10));
        slot1000.AvailableMasters.Should().HaveCount(2);
        slot1000.AvailableMasters.Should().Contain(m => m.Id == master1.Id);
        slot1000.AvailableMasters.Should().Contain(m => m.Id == master2.Id);

        var slot1030 = result.Single(s => s.Start == testDate.AddHours(10).AddMinutes(30));
        slot1030.AvailableMasters.Should().HaveCount(1);
        slot1030.AvailableMasters.Single().Id.Should().Be(master2.Id);
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldContainMasterDto_InSlot()
    {
        // Arrange
        var firstName = "Anna";
        var lastName = "Smith";

        var user = await CreateUserAsync($"{Guid.NewGuid()}@test.com", "+380661234567", firstName, lastName);
        await context.SaveChangesAsync();

        var master = await CreateMasterAsync(user);

        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Manicure", 60);
        await LinkMasterToServiceAsync(master.Id, service.Id);

        var testDate = FutureDate;
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(11, 0));

        _timeProvider.SetUtcNow(testDate.AddHours(7));

        // Act
        var result = await _sut.GetAvailableSlotsAsync(master.Id, service.Id, testDate);

        // Assert
        var slot = result.Should().ContainSingle().Subject;
        var dto = slot.AvailableMasters.Should().ContainSingle().Subject;

        dto.Id.Should().Be(master.Id);
        dto.FirstName.Should().Be(firstName);
        dto.LastName.Should().Be(lastName);
    }

    // ─── GetAvailableDatesAsync ────────────────────────────────────────────────

    [Fact]
    public async Task GetAvailableDatesAsync_ShouldReturnDates_WhenMasterHasFreeSlots()
    {
        // Arrange
        // Use a date 1 month ahead from "today" so the test never becomes stale by
        // landing in the past — the slot service filters out past dates.
        var testDate = DateTime.UtcNow.Date.AddMonths(1);
        var testYear = testDate.Year;
        var testMonth = testDate.Month;

        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Massage", 60);
        var master = await CreateMasterAsync();
        await LinkMasterToServiceAsync(master.Id, service.Id);

        // Create a schedule on the same day-of-week as testDate (10:00 – 12:00)
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(12, 0));

        // Fake "now" to be one day before testDate, so testDate's slots are in the future
        _timeProvider.SetUtcNow(testDate.AddDays(-1));

        // Act
        var result = await _sut.GetAvailableDatesAsync(service.Id, master.Id, testYear, testMonth);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().Contain(DateOnly.FromDateTime(testDate));
    }

    [Fact]
    public async Task GetAvailableDatesAsync_ShouldReturnEmpty_WhenWholeMonthIsBusy()
    {
        // Arrange
        var testDate = DateTime.UtcNow.Date.AddMonths(1);
        var testYear = testDate.Year;
        var testMonth = testDate.Month;

        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Massage", 60);
        var master = await CreateMasterAsync();
        await LinkMasterToServiceAsync(master.Id, service.Id);

        // Master works 10:00 – 11:00 (fits exactly one 60-min appointment)
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(11, 0));

        // Block that entire window with an appointment — no free slots remain
        await CreateAppointmentAsync(master.Id, service, testDate.AddHours(10));

        _timeProvider.SetUtcNow(testDate.AddDays(-1));

        // Act
        var result = await _sut.GetAvailableDatesAsync(service.Id, master.Id, testYear, testMonth);

        // Assert: testDate must not appear because there is no free slot
        result.Should().NotContain(DateOnly.FromDateTime(testDate));
    }

    [Fact]
    public async Task GetAvailableDatesAsync_ShouldSkipDatesInPast()
    {
        // Arrange
        var testDate = DateTime.UtcNow.Date.AddMonths(1); // reference point for "today"
        var pastDate = testDate.AddDays(-2); // two days before "today" → in the past
        var testYear = testDate.Year;
        var testMonth = testDate.Month;

        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Massage", 60);
        var master = await CreateMasterAsync();
        await LinkMasterToServiceAsync(master.Id, service.Id);

        // Give the master a working schedule on the day-of-week matching pastDate
        await CreateScheduleAsync(master.Id, (int)pastDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(12, 0));

        // Fake "now" as testDate, so pastDate is already in the past
        _timeProvider.SetUtcNow(testDate);

        // Act
        var result = await _sut.GetAvailableDatesAsync(service.Id, master.Id, testYear, testMonth);

        // Assert: past dates must be excluded regardless of schedule
        result.Should().NotContain(DateOnly.FromDateTime(pastDate));
    }

    // ─── IsMasterAvailableAsync ────────────────────────────────────────────────

    [Fact]
    public async Task IsMasterAvailableAsync_ShouldReturnFalse_WhenOutsideSchedule()
    {
        // Arrange
        // Use a future date so the appointment time (18:30) is not in the past right now.
        var testDate = DateTime.UtcNow.Date.AddMonths(1);
        var master = await CreateMasterAsync();

        // Schedule: 10:00 – 18:00
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0, 0), new TimeOnly(18, 0, 0));

        // Attempt to book 18:30 – 19:00 (after closing time)
        var start = testDate.AddHours(18).AddMinutes(30);
        var end = start.AddMinutes(30);

        // Act
        var result = await _sut.IsMasterAvailableAsync(master.Id, start, end, null, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsMasterAvailableAsync_ShouldReturnFalse_WhenMasterOnTimeOff()
    {
        // Arrange
        var testDate = DateTime.UtcNow.Date.AddMonths(1);
        var master = await CreateMasterAsync();

        // Wide schedule (9:00 – 21:00) so availability isn't blocked by hours
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(9, 0, 0), new TimeOnly(21, 0, 0));

        // Create a time-off entry that covers the entire test date
        await CreateTimeOffAsync(master.Id, DateOnly.FromDateTime(testDate));

        var start = testDate.AddHours(12);
        var end = start.AddHours(1);

        // Act
        var result = await _sut.IsMasterAvailableAsync(master.Id, start, end, null, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsMasterAvailableAsync_ShouldHandleOverlappingAppointments()
    {
        // Arrange
        var testDate = DateTime.UtcNow.Date.AddMonths(1);
        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Massage", 60);

        // Full-day schedule so only appointments block the master
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(0, 0), new TimeOnly(23, 59));

        // Existing appointment: 12:00 – 13:00
        var existingStart = testDate.AddHours(12);
        await CreateAppointmentAsync(master.Id, service, existingStart);

        // Act
        // Overlap case: new appointment at 12:30 – 13:30 (partially inside existing)
        var resultInternal = await _sut.IsMasterAvailableAsync(
            master.Id, existingStart.AddMinutes(30), existingStart.AddMinutes(90), null, CancellationToken.None);

        // Edge case: new appointment at 11:00 – 12:00 (ends exactly when existing starts) → should be free
        var resultEdge = await _sut.IsMasterAvailableAsync(
            master.Id, existingStart.AddHours(-1), existingStart, null, CancellationToken.None);

        // Assert
        resultInternal.Should().BeFalse();
        resultEdge.Should().BeTrue();
    }

    [Fact]
    public async Task IsMasterAvailableAsync_ShouldReturnTrue_WhenExactlyOnScheduleBorders()
    {
        // Arrange
        var testDate = DateTime.UtcNow.Date.AddMonths(1);
        var master = await CreateMasterAsync();

        // Schedule: 10:00 – 18:00
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(10, 0, 0), new TimeOnly(18, 0, 0));

        // Act 1: 10:00 – 11:00 (starts exactly at opening) → valid
        var startOpening = testDate.AddHours(10);
        var resultOpening = await _sut.IsMasterAvailableAsync(master.Id, startOpening, startOpening.AddHours(1), null,
            CancellationToken.None);

        // Act 2: 17:00 – 18:00 (ends exactly at closing) → valid
        var startClosing = testDate.AddHours(17);
        var resultClosing = await _sut.IsMasterAvailableAsync(master.Id, startClosing, startClosing.AddHours(1), null,
            CancellationToken.None);

        // Act 3: 17:30 – 18:30 (overruns closing by 30 min) → invalid
        var startTooLate = testDate.AddHours(17).AddMinutes(30);
        var resultTooLate = await _sut.IsMasterAvailableAsync(master.Id, startTooLate, startTooLate.AddHours(1), null,
            CancellationToken.None);

        // Assert
        resultOpening.Should().BeTrue();
        resultClosing.Should().BeTrue();
        resultTooLate.Should().BeFalse();
    }

    [Fact]
    public async Task IsMasterAvailableAsync_ShouldHandleComplexOverlaps()
    {
        // Arrange
        var testDate = DateTime.UtcNow.Date.AddMonths(1);
        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Massage", 60);

        // Full-day schedule so checking is only against appointments
        await CreateScheduleAsync(master.Id, (int)testDate.DayOfWeek, new TimeOnly(0, 0), new TimeOnly(23, 59));

        // Existing appointment: 12:00 – 13:00
        var existingStart = testDate.AddHours(12);
        var existingEnd = existingStart.AddHours(1);
        await CreateAppointmentAsync(master.Id, service, existingStart);

        // Act & Assert

        // Case 1: surrounds existing (11:30 – 13:30) → blocked
        (await _sut.IsMasterAvailableAsync(
                master.Id, existingStart.AddMinutes(-30), existingEnd.AddMinutes(30), null, CancellationToken.None))
            .Should().BeFalse();

        // Case 2: fully inside existing (12:15 – 12:45) → blocked
        (await _sut.IsMasterAvailableAsync(
                master.Id, existingStart.AddMinutes(15), existingEnd.AddMinutes(-15), null, CancellationToken.None))
            .Should().BeFalse();

        // Case 3: starts exactly when existing ends (13:00 – 14:00) → free
        (await _sut.IsMasterAvailableAsync(
                master.Id, existingEnd, existingEnd.AddHours(1), null, CancellationToken.None))
            .Should().BeTrue();

        // Case 4: exact same window (12:00 – 13:00) → blocked
        (await _sut.IsMasterAvailableAsync(
                master.Id, existingStart, existingEnd, null, CancellationToken.None))
            .Should().BeFalse();
    }
}
