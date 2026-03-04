using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.Catalog.GetAvailableSlots;
using Application.Services;
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
    private readonly SlotService _slotService;

    public SlotServiceTests()
    {
        _slotService = new SlotService(
            _masterRepoMock.Object,
            _serviceRepoMock.Object,
            _appointmentRepoMock.Object,
            _timeProviderMock.Object);

        // Default: now = yesterday (all future slots are valid)
        _timeProviderMock
            .Setup(x => x.GetUtcNow())
            .Returns(new DateTimeOffset(DateTime.UtcNow.AddDays(-1)));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenServiceNotFound()
    {
        _serviceRepoMock
            .Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Service?)null);

        var result = await _slotService.GetAvailableSlotsAsync(
            Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddDays(1));

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenMasterNotFound()
    {
        var masterId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var service = BuildService(serviceId, 60);

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetByIdAsync(masterId, It.IsAny<CancellationToken>())).ReturnsAsync((Master?)null);

        var result = await _slotService.GetAvailableSlotsAsync(
            masterId, serviceId, DateTime.UtcNow.AddDays(1));

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenMasterOnTimeOff()
    {
        var masterId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var date = DateTime.UtcNow.AddDays(1).Date;
        var master = BuildMaster(masterId);
        var service = BuildService(serviceId, 60);
        var schedule = BuildSchedule(masterId, date, new TimeOnly(10, 0), new TimeOnly(18, 0));

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetByIdAsync(masterId, It.IsAny<CancellationToken>())).ReturnsAsync(master);
        _masterRepoMock.Setup(x => x.GetScheduleForDayAsync(masterId, It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(schedule);
        _masterRepoMock.Setup(x => x.IsOnTimeOffAsync(masterId, date, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var result = await _slotService.GetAvailableSlotsAsync(masterId, serviceId, date);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenNoSchedule()
    {
        var masterId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var date = DateTime.UtcNow.AddDays(1).Date;
        var master = BuildMaster(masterId);
        var service = BuildService(serviceId, 60);

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetByIdAsync(masterId, It.IsAny<CancellationToken>())).ReturnsAsync(master);
        _masterRepoMock.Setup(x => x.GetScheduleForDayAsync(masterId, It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync((Schedule?)null);

        var result = await _slotService.GetAvailableSlotsAsync(masterId, serviceId, date);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenNoMastersProvideService()
    {
        var serviceId = Guid.NewGuid();
        var service = BuildService(serviceId, 60);

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetMastersByServiceAsync(serviceId, It.IsAny<CancellationToken>())).ReturnsAsync([]);

        var result = await _slotService.GetAvailableSlotsAsync(null, serviceId, DateTime.UtcNow.AddDays(1));

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnCorrectSlots_WhenNoAppointments()
    {
        // Schedule 10:00-12:00, duration 60 min, step 30 min
        // Expected: 10:00-11:00, 10:30-11:30, 11:00-12:00
        var (masterId, serviceId, date) = (Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddDays(1).Date);

        SetupSingleMaster(masterId, serviceId, date,
            duration: 60,
            start: new TimeOnly(10, 0),
            end: new TimeOnly(12, 0));

        var result = await _slotService.GetAvailableSlotsAsync(masterId, serviceId, date);

        result.Should().HaveCount(3);
        result[0].Start.Should().Be(date.AddHours(10));
        result[1].Start.Should().Be(date.AddHours(10).AddMinutes(30));
        result[2].Start.Should().Be(date.AddHours(11));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldSkipOverlappingSlots()
    {
        // Appointment at 10:30-11:30
        // Schedule 10:00-13:00, duration 60 min
        // Overlapping: 10:00, 10:30, 11:00 → Free: 11:30, 12:00
        var (masterId, serviceId, date) = (Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddDays(1).Date);
        var service = BuildService(serviceId, 60);
        var appointment = new Appointment(Guid.NewGuid(), masterId, service, date.AddHours(10).AddMinutes(30), "Note");

        SetupSingleMaster(masterId, serviceId, date,
            duration: 60,
            start: new TimeOnly(10, 0),
            end: new TimeOnly(13, 0),
            appointments: [appointment]);

        var result = await _slotService.GetAvailableSlotsAsync(masterId, serviceId, date);

        result.Should().HaveCount(2);
        result[0].Start.Should().Be(date.AddHours(11).AddMinutes(30));
        result[1].Start.Should().Be(date.AddHours(12));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldHandleNonStandardDuration()
    {
        // Duration 37 min, appointment at 10:05-10:42
        // 10:00-10:37 OVERLAPS, 10:30-11:07 OVERLAPS, 11:00-11:37 FREE, 11:30-12:07 OUT OF BOUNDS
        var (masterId, serviceId, date) = (Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddDays(2).Date);
        _timeProviderMock.Setup(x => x.GetUtcNow()).Returns(new DateTimeOffset(date.AddDays(-1)));

        var service = BuildService(serviceId, 37);
        var appointment = new Appointment(Guid.NewGuid(), masterId, service, date.AddHours(10).AddMinutes(5), "Note");

        SetupSingleMaster(masterId, serviceId, date,
            duration: 37,
            start: new TimeOnly(10, 0),
            end: new TimeOnly(12, 0),
            appointments: [appointment]);

        var result = await _slotService.GetAvailableSlotsAsync(masterId, serviceId, date);

        result.Should().HaveCount(1);
        result[0].Start.Should().Be(date.AddHours(11));
        result[0].End.Should().Be(date.AddHours(11).AddMinutes(37));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldSkipSlotsBeforeMinBookingTime()
    {
        // Now = 16:00, minBooking = 17:00, schedule 10:00-18:00, duration 30 min
        // Only 17:00 and 17:30 should be returned
        var (masterId, serviceId, date) = (Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddDays(1).Date);
        _timeProviderMock.Setup(x => x.GetUtcNow()).Returns(new DateTimeOffset(date.AddHours(16)));

        SetupSingleMaster(masterId, serviceId, date,
            duration: 30,
            start: new TimeOnly(10, 0),
            end: new TimeOnly(18, 0));

        var result = await _slotService.GetAvailableSlotsAsync(masterId, serviceId, date);

        result.Should().HaveCount(2);
        result.First().Start.Should().Be(date.AddHours(17));
        result.Last().Start.Should().Be(date.AddHours(17).AddMinutes(30));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldAggregateSlots_WhenMasterIdIsNull()
    {
        // Master1: 10:00-11:00 (1 slot: 10:00)
        // Master2: 10:00-12:00 (3 slots: 10:00, 10:30, 11:00)
        // Result: 3 unique slots, 10:00 has 2 masters
        var (serviceId, date) = (Guid.NewGuid(), DateTime.UtcNow.AddDays(1).Date);
        var service = BuildService(serviceId, 60);

        var master1 = BuildMaster(Guid.NewGuid());
        var master2 = BuildMaster(Guid.NewGuid());

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetMastersByServiceAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([master1, master2]);

        SetupMasterSchedule(master1.Id, date, new TimeOnly(10, 0), new TimeOnly(11, 0));
        SetupMasterSchedule(master2.Id, date, new TimeOnly(10, 0), new TimeOnly(12, 0));

        var result = await _slotService.GetAvailableSlotsAsync(null, serviceId, date);

        result.Should().HaveCount(3);
        result.Should().BeInAscendingOrder(s => s.Start);

        var slotAt10 = result.Single(s => s.Start.TimeOfDay == new TimeSpan(10, 0, 0));
        slotAt10.AvailableMasters.Should().HaveCount(2);

        var slotAt1030 = result.Single(s => s.Start.TimeOfDay == new TimeSpan(10, 30, 0));
        slotAt1030.AvailableMasters.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldContainMasterDto_InSlot()
    {
        var masterId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var date = DateTime.UtcNow.AddDays(1).Date;
        var master = BuildMaster(masterId, firstName: "Anna", lastName: "Smith");

        SetupSingleMaster(masterId, serviceId, date,
            duration: 60,
            start: new TimeOnly(10, 0),
            end: new TimeOnly(11, 0),
            masterEntity: master);

        var result = await _slotService.GetAvailableSlotsAsync(masterId, serviceId, date);

        var dto = result.Single().AvailableMasters.Single();
        dto.Id.Should().Be(masterId);
        dto.FirstName.Should().Be("Anna");
        dto.LastName.Should().Be("Smith");
    }

    private void SetupSingleMaster(
        Guid masterId,
        Guid serviceId,
        DateTime date,
        int duration,
        TimeOnly start,
        TimeOnly end,
        List<Appointment>? appointments = null,
        Master? masterEntity = null)
    {
        var service = BuildService(serviceId, duration);
        var master = masterEntity ?? BuildMaster(masterId);

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetByIdAsync(masterId, It.IsAny<CancellationToken>())).ReturnsAsync(master);

        SetupMasterSchedule(masterId, date, start, end, appointments);
    }

    private void SetupMasterSchedule(
        Guid masterId,
        DateTime date,
        TimeOnly start,
        TimeOnly end,
        List<Appointment>? appointments = null)
    {
        var schedule = BuildSchedule(masterId, date, start, end);

        _masterRepoMock.Setup(x => x.GetScheduleForDayAsync(masterId, It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(schedule);
        _masterRepoMock.Setup(x => x.IsOnTimeOffAsync(masterId, date, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _appointmentRepoMock.Setup(x => x.GetByMasterAndDateAsync(masterId, date, It.IsAny<CancellationToken>()))
            .ReturnsAsync(appointments ?? []);
    }

    private static Service BuildService(Guid id, int duration) =>
        new(id, "Test Service", "Desc", duration, 500m);

    private static Schedule BuildSchedule(Guid masterId, DateTime date, TimeOnly start, TimeOnly end) =>
        new(masterId, (int)date.DayOfWeek, start, end);

    private static Master BuildMaster(Guid id, string firstName = "John", string lastName = "Doe")
    {
        var user = new User(firstName, lastName, $"{firstName.ToLower()}@test.com", Guid.NewGuid().ToString(), "+380000000000");
        var master = (Master)Activator.CreateInstance(typeof(Master), true)!;
        typeof(Master).GetProperty("Id")?.SetValue(master, id);
        typeof(Master).GetProperty("User")?.SetValue(master, user);
        return master;
    }
}
