using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.Master.GetMasterWorkingHours;
using Domain.Entities;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Masters;

public class GetMasterWorkingHoursHandlerTests
{
    private readonly Mock<IMasterRepository> _masterRepoMock;
    private readonly Mock<IScheduleRepository> _scheduleRepoMock;
    private readonly Mock<ITimeOffRepository> _timeOffRepoMock;
    private readonly Mock<ICurrentUserContext> _userContextMock;
    private readonly Mock<TimeProvider> _timeProviderMock;
    private readonly GetMasterWorkingHoursHandler _handler;

    public GetMasterWorkingHoursHandlerTests()
    {
        _masterRepoMock = new Mock<IMasterRepository>();
        _scheduleRepoMock = new Mock<IScheduleRepository>();
        _timeOffRepoMock = new Mock<ITimeOffRepository>();
        _userContextMock = new Mock<ICurrentUserContext>();
        _timeProviderMock = new Mock<TimeProvider>();

        _handler = new GetMasterWorkingHoursHandler(
            _masterRepoMock.Object,
            _scheduleRepoMock.Object,
            _timeOffRepoMock.Object,
            _userContextMock.Object,
            _timeProviderMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenMasterIdDoesNotMatchCurrentUser()
    {
        // Arrange
        var currentUserId = Guid.NewGuid();
        var anotherMasterId = Guid.NewGuid();
        var master = CreateMaster(currentUserId, Guid.NewGuid());

        _userContextMock.Setup(x => x.Id).Returns(currentUserId);
        _masterRepoMock.Setup(x => x.GetByUserIdAsync(anotherMasterId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(master);

        // Act
        var result = await _handler.Handle(new GetMasterWorkingHoursQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_Should_ReturnWorkingHours_WithCorrectUtcCalculation()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var masterId = Guid.NewGuid();
        var master = CreateMaster(userId, masterId);

        var utcNow = new DateTimeOffset(new DateTime(2026, 6, 1), TimeSpan.Zero);
        _timeProviderMock.Setup(x => x.GetUtcNow()).Returns(utcNow);

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _masterRepoMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(master);

        // Monday: works from 9:00 to 18:00
        var schedule = new Schedule(masterId, 1, new TimeOnly(9, 0), new TimeOnly(18, 0));
        _scheduleRepoMock.Setup(x => x.GetByMasterIdAsync(masterId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Schedule> { schedule });

        _timeOffRepoMock.Setup(x => x.GetByMasterIdAsync(masterId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TimeOff>());

        // Act
        var result = await _handler.Handle(new GetMasterWorkingHoursQuery(6, 2026), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // June 1 2026 monday
        var monday = result.Value.First(x => x.Date.Day == 1);
        monday.IsWorkingDay.Should().BeTrue();
        monday.StartTimeUtc.Should().Be(new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc));
        monday.EndTimeUtc.Should().Be(new DateTime(2026, 6, 1, 18, 0, 0, DateTimeKind.Utc));

        // June 2 2026 tuesday
        var tuesday = result.Value.First(x => x.Date.Day == 2);
        tuesday.IsWorkingDay.Should().BeFalse();
        tuesday.Type.Should().Be("RegularOff");
    }

    [Fact]
    public async Task Handle_Should_MarkDayAsTimeOff_WhenTimeOffExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var masterId = Guid.NewGuid();
        var master = CreateMaster(userId, masterId);

        var utcNow = new DateTimeOffset(new DateTime(2026, 6, 1), TimeSpan.Zero);
        _timeProviderMock.Setup(x => x.GetUtcNow()).Returns(utcNow);

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _masterRepoMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(master);

        var schedule = new Schedule(masterId, 1, new TimeOnly(9, 0), new TimeOnly(18, 0));
        _scheduleRepoMock.Setup(x => x.GetByMasterIdAsync(masterId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Schedule> { schedule });

        // Has time off for June 1 2026
        var timeOff = new TimeOff(masterId, new DateOnly(2026, 6, 1), new DateOnly(2026, 6, 1), "Vacation");
        _timeOffRepoMock.Setup(x => x.GetByMasterIdAsync(masterId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TimeOff> { timeOff });

        // Act
        var result = await _handler.Handle(new GetMasterWorkingHoursQuery(6, 2026), CancellationToken.None);

        // Assert
        var monday = result.Value.First(x => x.Date.Day == 1);
        monday.IsWorkingDay.Should().BeFalse();
        monday.Type.Should().Be("TimeOff");
        monday.StartTimeUtc.Should().BeNull();
    }

    private Master CreateMaster(Guid userId, Guid masterId)
    {
        var master = new Master(userId, "Bio");
        typeof(Master).GetProperty(nameof(Master.Id))?.SetValue(master, masterId);
        return master;
    }
}
