using Application.Common.Interfaces.Repos;
using Application.Features.Catalog.GetAvailableSlots;
using Application.Services;
using Domain.Common;
using Domain.Entities;
using FluentAssertions;
using Moq;
using Xunit;

namespace ApplicationTests.Services;

public class SlotServiceTests
{
    private readonly Mock<IMasterRepository> _masterRepoMock = new();
    private readonly Mock<IServiceRepository> _serviceRepoMock = new();
    private readonly Mock<IAppointmentRepository> _appointmentRepoMock = new();
    private readonly Mock<TimeProvider> _timeProviderMock = new();
    private readonly SlotService _sut;

    // Deterministic constants to prevent flaky tests
    private static readonly DateTime Today = DateTime.UtcNow;
    private static readonly DateTime NextMonthDate = new DateTime(Today.Year, Today.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);
    private static readonly DateTime FixedDate = new(NextMonthDate.Year, NextMonthDate.Month, 10, 0, 0, 0, DateTimeKind.Utc);
    private static readonly Guid ServiceId = Guid.NewGuid();
    private static readonly Guid MasterId = Guid.NewGuid();

    public SlotServiceTests()
    {
        _sut = new SlotService(
            _masterRepoMock.Object,
            _serviceRepoMock.Object,
            _appointmentRepoMock.Object,
            _timeProviderMock.Object);

        // Default: Time is "yesterday" so all slots on FixedDate are in the future and valid
        _timeProviderMock.Setup(x => x.GetUtcNow()).Returns(new DateTimeOffset(FixedDate.AddDays(-1)));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenServiceNotFound()
    {
        _serviceRepoMock
            .Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Service?)null);

        var result = await _sut.GetAvailableSlotsAsync(MasterId, ServiceId, FixedDate);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenMasterNotFound()
    {
        SetupService(duration: 60);

        // Setup GetAllWithDetailsAsync to return an empty list (fixing the ArgumentNullException)
        SetupMastersForService();

        var result = await _sut.GetAvailableSlotsAsync(MasterId, ServiceId, FixedDate);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenMasterOnTimeOff()
    {
        SetupService(duration: 60);
        var master = SetupMaster(MasterId);
        SetupMastersForService(master);
        SetupSchedule(MasterId, new TimeOnly(10, 0), new TimeOnly(18, 0));

        SetupTimeOff(MasterId, isOff: true); // Master is off

        var result = await _sut.GetAvailableSlotsAsync(MasterId, ServiceId, FixedDate);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenNoSchedule()
    {
        SetupService(duration: 60);
        var master = SetupMaster(MasterId);
        SetupMastersForService(master);

        // Schedule returns null
        _masterRepoMock.Setup(x => x.GetScheduleForDayAsync(MasterId, It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Schedule?)null);

        var result = await _sut.GetAvailableSlotsAsync(MasterId, ServiceId, FixedDate);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenNoMastersProvideService()
    {
        SetupService(duration: 60);
        SetupMastersForService(); // Empty list returned for the service

        var result = await _sut.GetAvailableSlotsAsync(null, ServiceId, FixedDate);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnCorrectSlots_WhenNoAppointments()
    {
        // Schedule 10:00-12:00, duration 60 min, step 30 min -> Fits 10:00, 10:30, 11:00
        SetupService(duration: 60);
        var master = SetupMaster(MasterId);
        SetupMastersForService(master);
        SetupSchedule(MasterId, new TimeOnly(10, 0), new TimeOnly(12, 0));
        SetupAppointments(MasterId); // No appointments

        var result = await _sut.GetAvailableSlotsAsync(MasterId, ServiceId, FixedDate);

        result.Should().HaveCount(3);
        result[0].Start.Should().Be(FixedDate.AddHours(10));
        result[1].Start.Should().Be(FixedDate.AddHours(10).AddMinutes(30));
        result[2].Start.Should().Be(FixedDate.AddHours(11));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldSkipOverlappingSlots()
    {
        // Schedule 10:00-13:00. Appointment at 10:30-11:30.
        // 10:00, 10:30, 11:00 overlap. Free: 11:30, 12:00.
        var service = SetupService(duration: 60);
        var master = SetupMaster(MasterId);
        SetupMastersForService(master);
        SetupSchedule(MasterId, new TimeOnly(10, 0), new TimeOnly(13, 0));

        var appointment = CreateAppointment(MasterId, service, FixedDate.AddHours(10).AddMinutes(30));
        SetupAppointments(MasterId, appointment);

        var result = await _sut.GetAvailableSlotsAsync(MasterId, ServiceId, FixedDate);

        result.Should().HaveCount(2);
        result[0].Start.Should().Be(FixedDate.AddHours(11).AddMinutes(30));
        result[1].Start.Should().Be(FixedDate.AddHours(12));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldHandleNonStandardDuration()
    {
        // Duration 37 min. Appointment at 10:05-10:42.
        // 10:00(X), 10:30(X), 11:00(OK), 11:30(Out of bounds)
        var service = SetupService(duration: 37);
        var master = SetupMaster(MasterId);
        SetupMastersForService(master);
        SetupSchedule(MasterId, new TimeOnly(10, 0), new TimeOnly(12, 0));

        var appointment = CreateAppointment(MasterId, service, FixedDate.AddHours(10).AddMinutes(5));
        SetupAppointments(MasterId, appointment);

        var result = await _sut.GetAvailableSlotsAsync(MasterId, ServiceId, FixedDate);

        result.Should().ContainSingle();
        result[0].Start.Should().Be(FixedDate.AddHours(11));
        result[0].End.Should().Be(FixedDate.AddHours(11).AddMinutes(37));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldSkipSlotsBeforeMinBookingTime()
    {
        // "Now" = 16:00. Min booking is +1 hour = 17:00.
        // Schedule 10:00-18:00. Duration 30 min. Only 17:00 and 17:30 should be available.
        _timeProviderMock.Setup(x => x.GetUtcNow()).Returns(new DateTimeOffset(FixedDate.AddHours(16)));

        SetupService(duration: 30);
        var master = SetupMaster(MasterId);
        SetupMastersForService(master);
        SetupSchedule(MasterId, new TimeOnly(10, 0), new TimeOnly(18, 0));
        SetupAppointments(MasterId);

        var result = await _sut.GetAvailableSlotsAsync(MasterId, ServiceId, FixedDate);

        result.Should().HaveCount(2);
        result[0].Start.Should().Be(FixedDate.AddHours(17));
        result[1].Start.Should().Be(FixedDate.AddHours(17).AddMinutes(30));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldAggregateSlots_WhenMasterIdIsNull()
    {
        // Master1: 10:00-11:00 (1 slot: 10:00)
        // Master2: 10:00-12:00 (3 slots: 10:00, 10:30, 11:00)
        SetupService(duration: 60);

        var master1Id = Guid.NewGuid();
        var master2Id = Guid.NewGuid();
        var master1 = SetupMaster(master1Id);
        var master2 = SetupMaster(master2Id);

        SetupMastersForService(master1, master2);

        SetupSchedule(master1Id, new TimeOnly(10, 0), new TimeOnly(11, 0));
        SetupSchedule(master2Id, new TimeOnly(10, 0), new TimeOnly(12, 0));
        SetupAppointments(master1Id);
        SetupAppointments(master2Id);

        var result = await _sut.GetAvailableSlotsAsync(null, ServiceId, FixedDate);

        result.Should().HaveCount(3);
        result.Should().BeInAscendingOrder(s => s.Start);

        result.Single(s => s.Start == FixedDate.AddHours(10)).AvailableMasters.Should().HaveCount(2);
        result.Single(s => s.Start == FixedDate.AddHours(10).AddMinutes(30)).AvailableMasters.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldContainMasterDto_InSlot()
    {
        SetupService(duration: 60);
        var master = SetupMaster(MasterId, "Anna", "Smith");
        SetupMastersForService(master);
        SetupSchedule(MasterId, new TimeOnly(10, 0), new TimeOnly(11, 0));
        SetupAppointments(MasterId);

        var result = await _sut.GetAvailableSlotsAsync(MasterId, ServiceId, FixedDate);

        var dto = result.Single().AvailableMasters.Single();
        dto.Id.Should().Be(MasterId);
        dto.FirstName.Should().Be("Anna");
        dto.LastName.Should().Be("Smith");
    }

    [Fact]
    public async Task GetAvailableDatesAsync_ShouldReturnDates_WhenMasterHasFreeSlots()
    {
        // Arrange
        var testYear = FixedDate.Year;
        var testMonth = FixedDate.Month;

        SetupService(60);
        var master = SetupMaster(MasterId);
        SetupMastersForService(master);

        // Setup master to work on the day of the week corresponding to our FixedDate
        var schedules = new List<Schedule> { new(MasterId, (int)FixedDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(12, 0)) };
        _masterRepoMock.Setup(x => x.GetSchedulesForMasterAsync(MasterId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(schedules);

        // No busy intervals (appointments or time-offs)
        _appointmentRepoMock.Setup(x => x.GetBusyIntervalsAsync(MasterId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<BusyInterval>());

        // Act
        var result = await _sut.GetAvailableDatesAsync(ServiceId, MasterId, testYear, testMonth);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().Contain(DateOnly.FromDateTime(FixedDate));
    }

    [Fact]
    public async Task GetAvailableDatesAsync_ShouldReturnEmpty_WhenWholeMonthIsBusy()
    {
        // Arrange
        var testYear = FixedDate.Year;
        var testMonth = FixedDate.Month;

        SetupService(60);
        var master = SetupMaster(MasterId);
        SetupMastersForService(master);

        // Master works 10:00-11:00
        var schedules = new List<Schedule> { new(MasterId, (int)FixedDate.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(11, 0)) };
        _masterRepoMock.Setup(x => x.GetSchedulesForMasterAsync(MasterId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(schedules);

        // But that specific window is fully blocked by a busy interval
        var busy = new List<BusyInterval> { new(FixedDate.AddHours(10), FixedDate.AddHours(11)) };
        _appointmentRepoMock.Setup(x => x.GetBusyIntervalsAsync(MasterId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(busy);

        // Act
        var result = await _sut.GetAvailableDatesAsync(ServiceId, MasterId, testYear, testMonth);

        // Assert
        result.Should().NotContain(DateOnly.FromDateTime(FixedDate));
    }

    [Fact]
    public async Task GetAvailableDatesAsync_ShouldSkipDatesInPast()
    {
        // Arrange
        // Mock "Now" as exactly today.
        _timeProviderMock.Setup(x => x.GetUtcNow()).Returns(new DateTimeOffset(Today));

        SetupService(60);
        var master = SetupMaster(MasterId);
        SetupMastersForService(master);

        // Setup a working day for yesterday
        var yesterday = Today.AddDays(-1);
        SetupScheduleForMaster(MasterId, (int)yesterday.DayOfWeek);

        // Act
        var result = await _sut.GetAvailableDatesAsync(ServiceId, MasterId, Today.Year, Today.Month);

        // Assert
        result.Should().NotContain(DateOnly.FromDateTime(yesterday));
    }

    #region Helpers

    private Service SetupService(int duration)
    {
        var service = new Service(ServiceId, "Test Service", "Desc", duration, 500m);
        _serviceRepoMock.Setup(x => x.GetByIdAsync(ServiceId, It.IsAny<CancellationToken>())).ReturnsAsync(service);
        return service;
    }

    private Master SetupMaster(Guid id, string firstName = "John", string lastName = "Doe")
    {
        var user = User.CreateRegistered(firstName, lastName, $"{firstName.ToLower()}@test.com", "hash", "+380000000000");
        var master = (Master)Activator.CreateInstance(typeof(Master), true)!;
        typeof(Master).GetProperty("Id")?.SetValue(master, id);
        typeof(Master).GetProperty("User")?.SetValue(master, user);

        _masterRepoMock.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(master);
        return master;
    }

    private void SetupMastersForService(params Master[] masters)
    {
        _masterRepoMock.Setup(x => x.GetAllWithDetailsAsync(ServiceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(masters.ToList());
    }

    private void SetupSchedule(Guid masterId, TimeOnly start, TimeOnly end)
    {
        var schedule = new Schedule(masterId, (int)FixedDate.DayOfWeek, start, end);
        _masterRepoMock.Setup(x => x.GetScheduleForDayAsync(masterId, It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(schedule);

        SetupTimeOff(masterId, false);
    }

    private void SetupTimeOff(Guid masterId, bool isOff)
    {
        _masterRepoMock.Setup(x => x.IsOnTimeOffAsync(masterId, FixedDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(isOff);
    }

    private void SetupAppointments(Guid masterId, params Appointment[] appointments)
    {
        _appointmentRepoMock.Setup(x => x.GetByMasterAndDateAsync(masterId, FixedDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(appointments.ToList());
    }

    private static Appointment CreateAppointment(Guid masterId, Service service, DateTime start)
    {
        return new Appointment(Guid.NewGuid(), masterId, service, start, "Note");
    }

    private void SetupScheduleForMaster(Guid masterId, int dayOfWeek)
    {
        var schedules = new List<Schedule> { new(masterId, dayOfWeek, new TimeOnly(9,0), new TimeOnly(18,0)) };
        _masterRepoMock.Setup(x => x.GetSchedulesForMasterAsync(masterId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(schedules);

        _appointmentRepoMock.Setup(x => x.GetBusyIntervalsAsync(masterId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<BusyInterval>());
    }

    #endregion
}
