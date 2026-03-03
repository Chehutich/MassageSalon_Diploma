using Application.Common.Interfaces.Repos;
using Application.Services;
using Domain.Entities;
using Domain.ValueObjects;
using FluentAssertions;
using Moq;
using Xunit;

namespace ApplicationTests.Services;

public class SlotServiceTests
{
    private readonly Mock<IMasterRepository> _masterRepoMock;
    private readonly Mock<IServiceRepository> _serviceRepoMock;
    private readonly Mock<IAppointmentRepository> _appointmentRepoMock;
    private readonly Mock<TimeProvider> _timeProviderMock;
    private readonly SlotService _slotService;

    public SlotServiceTests()
    {
        _masterRepoMock = new Mock<IMasterRepository>();
        _serviceRepoMock = new Mock<IServiceRepository>();
        _appointmentRepoMock = new Mock<IAppointmentRepository>();
        _timeProviderMock = new Mock<TimeProvider>();

        _slotService = new SlotService(
            _masterRepoMock.Object,
            _serviceRepoMock.Object,
            _appointmentRepoMock.Object,
            _timeProviderMock.Object);
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenServiceNotFound()
    {
        // Arrange
        _serviceRepoMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), CancellationToken.None))
            .ReturnsAsync((Service?)null);

        // Act
        var result =
            await _slotService.GetAvailableSlotsAsync(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnEmpty_WhenMasterOnTimeOff()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        var masterId = Guid.NewGuid();
        var date = DateTime.UtcNow.AddDays(1);

        var service = new Service(Guid.NewGuid(), "Massage", "Desc", 60, 1000m);
        var schedule = new Schedule(masterId, (int)date.DayOfWeek, new TimeOnly(10, 0),
            new TimeOnly(18, 0));

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, CancellationToken.None)).ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetScheduleForDayAsync(masterId, It.IsAny<int>(), CancellationToken.None)).ReturnsAsync(schedule);

        _masterRepoMock.Setup(x => x.IsOnTimeOffAsync(masterId, date, CancellationToken.None)).ReturnsAsync(true);

        // Act
        var result = await _slotService.GetAvailableSlotsAsync(masterId, serviceId, date, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldReturnCorrectSlots_WhenNoAppointments()
    {
        // Arrange
        var masterId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var date = DateTime.UtcNow.AddDays(1).Date;

        // 60 minutes
        var service = new Service(Guid.NewGuid(), "Massage", "Desc", 60, 1000m);

        // Schedule: 10:00 - 12:00
        var schedule = new Schedule(masterId, (int)date.DayOfWeek, new TimeOnly(10, 0),
            new TimeOnly(12, 0));

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, CancellationToken.None)).ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetScheduleForDayAsync(masterId, It.IsAny<int>(), CancellationToken.None)).ReturnsAsync(schedule);
        _masterRepoMock.Setup(x => x.IsOnTimeOffAsync(masterId, date, CancellationToken.None)).ReturnsAsync(false);
        _appointmentRepoMock.Setup(x => x.GetByMasterAndDateAsync(masterId, date, CancellationToken.None))
            .ReturnsAsync(new List<Appointment>());

        // Act
        var result = await _slotService.GetAvailableSlotsAsync(masterId, serviceId, date, CancellationToken.None);

        // Assert
        // Expecting slots:
        // 10:00 - 11:00
        // 10:30 - 11:30
        // 11:00 - 12:00
        result.Should().HaveCount(3);
        result[0].Start.Should().Be(date.AddHours(10));
        result[1].Start.Should().Be(date.AddHours(10).AddMinutes(30));
        result[2].Start.Should().Be(date.AddHours(11));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldSkipOverlappingSlots()
    {
        // Arrange
        var masterId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var date = DateTime.UtcNow.AddDays(1).Date;

        var service = new Service(Guid.NewGuid(), "Massage", "Desc", 60, 1000m);

        // Schedule: 10:00 - 13:00
        var schedule = new Schedule(masterId, (int)date.DayOfWeek, new TimeOnly(10, 0),
            new TimeOnly(13, 0));

        // Have an appointment at 10:30
        var appointmentStart = date.AddHours(10).AddMinutes(30);
        var existingAppointment = new Appointment(Guid.NewGuid(), masterId, service, appointmentStart, "Note");

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, CancellationToken.None)).ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetScheduleForDayAsync(masterId, It.IsAny<int>(), CancellationToken.None)).ReturnsAsync(schedule);
        _masterRepoMock.Setup(x => x.IsOnTimeOffAsync(masterId, date, CancellationToken.None)).ReturnsAsync(false);
        _appointmentRepoMock.Setup(x => x.GetByMasterAndDateAsync(masterId, date, CancellationToken.None))
            .ReturnsAsync(new List<Appointment> { existingAppointment });

        // Act
        var result = await _slotService.GetAvailableSlotsAsync(masterId, serviceId, date, CancellationToken.None);

        // Assert
        // What slots could be (30 minutes):
        // 10:00-11:00 -> OVERLAPS from 10:30-11:30
        // 10:30-11:30 -> OVERLAPS
        // 11:00-12:00 -> OVERLAPS
        // 11:30-12:30 -> FREE!
        // 12:00-13:00 -> FREE!

        result.Should().HaveCount(2);
        result[0].Start.Should().Be(date.AddHours(11).AddMinutes(30));
        result[1].Start.Should().Be(date.AddHours(12));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldHandleWeirdDurations_Like37Minutes()
    {
        // Arrange
        var masterId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var date = DateTime.UtcNow.AddDays(1).Date;

        // Weird duration: exactly 37 minutes
        var service = new Service(Guid.NewGuid(), "Weird Procedure", "Desc", 37, 500m);

        // Schedule: 10:00 - 12:00 (Exactly 2 hours)
        var schedule = new Schedule(masterId, (int)date.DayOfWeek, new TimeOnly(10, 0),
            new TimeOnly(12, 0));

        // Existing appointment starts at an awkward time: 10:05
        // It will last 37 minutes, meaning it ends at 10:42
        var appointmentStart = date.AddHours(10).AddMinutes(5);
        var weirdAppointment = new Appointment(Guid.NewGuid(), masterId, service, appointmentStart, "Note");

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, CancellationToken.None)).ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetScheduleForDayAsync(masterId, It.IsAny<int>(), CancellationToken.None)).ReturnsAsync(schedule);
        _masterRepoMock.Setup(x => x.IsOnTimeOffAsync(masterId, date, CancellationToken.None)).ReturnsAsync(false);
        _appointmentRepoMock.Setup(x => x.GetByMasterAndDateAsync(masterId, date, CancellationToken.None))
            .ReturnsAsync(new List<Appointment> { weirdAppointment });

        // Act
        var result = await _slotService.GetAvailableSlotsAsync(masterId, serviceId, date, CancellationToken.None);

        // Assert
        // Slot 10:00 - 10:37 -> OVERLAPS with 10:05 - 10:42
        // Slot 10:30 - 11:07 -> OVERLAPS with 10:05 - 10:42
        // Slot 11:00 - 11:37 -> FREE!
        // Slot 11:30 - 12:07 -> OUT OF BOUNDS (Schedule ends at 12:00)

        result.Should().HaveCount(1); // Only ONE valid slot should survive!

        result[0].Start.Should().Be(date.AddHours(11));
        result[0].End.Should().Be(date.AddHours(11).AddMinutes(37));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_ShouldSkipPastSlots_WhenRequestedLaterInDay()
    {
        // Arrange
        var masterId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();

        // Today
        var date = DateTime.UtcNow.AddDays(1).Date;

        // Service with 30 minutes duration
        var service = new Service(serviceId, "Quick Cut", "Desc", 30, 500m);

        // Schedule: 10:00 - 18:00
        var schedule = new Schedule(masterId, (short)date.DayOfWeek, new TimeOnly(10, 0), new TimeOnly(18, 0));

        var mockCurrentTime = date.AddHours(16); // 16:00:00 UTC

        var timeProviderMock = new Mock<TimeProvider>();
        timeProviderMock
            .Setup(x => x.GetUtcNow())
            .Returns(new DateTimeOffset(mockCurrentTime));

        var slotService = new SlotService(
            _masterRepoMock.Object,
            _serviceRepoMock.Object,
            _appointmentRepoMock.Object,
            timeProviderMock.Object);

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, CancellationToken.None)).ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetScheduleForDayAsync(masterId, It.IsAny<int>(), CancellationToken.None)).ReturnsAsync(schedule);
        _masterRepoMock.Setup(x => x.IsOnTimeOffAsync(masterId, date, CancellationToken.None)).ReturnsAsync(false);
        _appointmentRepoMock.Setup(x => x.GetByMasterAndDateAsync(masterId, date, CancellationToken.None)).ReturnsAsync(new List<Appointment>());

        // Act
        var result = await slotService.GetAvailableSlotsAsync(masterId, serviceId, date, CancellationToken.None);

        // Assert
        // Now 16:00. Buffer = 1 час. Minimal time to book = 17:00.
        // Slots before 17:00 should be skipped.

        result.Should().NotBeEmpty();
        result.First().Start.Should().Be(date.AddHours(17));
        result.Should().HaveCount(2);
    }
}
