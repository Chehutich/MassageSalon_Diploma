using System.Reflection;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.Master.GetMasterSchedule;
using Domain.Entities;
using Domain.Enums;
using FluentAssertions;
using Microsoft.Extensions.Time.Testing;
using Moq;

namespace ApplicationTests.Features.MasterTests;

public class GetMasterScheduleHandlerTests
{
    private readonly Mock<IAppointmentRepository> _appointmentRepoMock;
    private readonly Mock<ICurrentUserContext> _userContextMock;
    private readonly Mock<IMasterRepository> _masterRepoMock;
    private readonly FakeTimeProvider _timeProvider;
    private readonly GetMasterScheduleHandler _handler;

    public GetMasterScheduleHandlerTests()
    {
        _appointmentRepoMock = new Mock<IAppointmentRepository>();
        _userContextMock = new Mock<ICurrentUserContext>();
        _timeProvider = new FakeTimeProvider();
        _masterRepoMock = new Mock<IMasterRepository>();

        _timeProvider.SetUtcNow(new DateTimeOffset(2026, 3, 11, 10, 0, 0, TimeSpan.Zero));

        _handler = new GetMasterScheduleHandler(
            _appointmentRepoMock.Object,
            _masterRepoMock.Object,
            _userContextMock.Object,
            _timeProvider);
    }

    [Fact]
    public async Task Handle_ShouldUseDefaultDates_WhenParametersAreNull()
    {
        // Arrange
        var masterId = Guid.NewGuid();
        _userContextMock.Setup(x => x.Id).Returns(masterId);

        // FIX: Setup the Master repository mock to prevent early exit
        var master = (Domain.Entities.Master)Activator.CreateInstance(typeof(Domain.Entities.Master), true)!;
        SetPrivate(master, "Id", masterId);
        _masterRepoMock.Setup(x => x.GetByUserIdAsync(masterId, It.IsAny<CancellationToken>())).ReturnsAsync(master);
        _masterRepoMock.Setup(x => x.GetByIdAsync(masterId, It.IsAny<CancellationToken>())).ReturnsAsync(master);

        var expectedFrom = new DateTime(2026, 3, 11, 0, 0, 0, DateTimeKind.Utc);
        var expectedTo = expectedFrom.AddDays(7);

        _appointmentRepoMock
            .Setup(x => x.GetMasterScheduleAsync(masterId, expectedFrom, expectedTo, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Appointment>());

        // Act
        var result = await _handler.Handle(new GetMasterScheduleQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _appointmentRepoMock.Verify(x => x.GetMasterScheduleAsync(
            masterId,
            expectedFrom,
            expectedTo,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldUseProvidedDates_WhenParametersAreGiven()
    {
        // Arrange
        var masterId = Guid.NewGuid();
        _userContextMock.Setup(x => x.Id).Returns(masterId);

        // FIX: Setup the Master repository mock to prevent early exit
        var master = (Domain.Entities.Master)Activator.CreateInstance(typeof(Domain.Entities.Master), true)!;
        SetPrivate(master, "Id", masterId);
        _masterRepoMock.Setup(x => x.GetByUserIdAsync(masterId, It.IsAny<CancellationToken>())).ReturnsAsync(master);
        _masterRepoMock.Setup(x => x.GetByIdAsync(masterId, It.IsAny<CancellationToken>())).ReturnsAsync(master);

        var customFrom = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc);
        var customTo = new DateTime(2026, 4, 2, 0, 0, 0, DateTimeKind.Utc);

        _appointmentRepoMock
            .Setup(x => x.GetMasterScheduleAsync(masterId, customFrom, customTo, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Appointment>());

        // Act
        var result = await _handler.Handle(new GetMasterScheduleQuery(customFrom, customTo), CancellationToken.None);

        // Assert
        _appointmentRepoMock.Verify(x => x.GetMasterScheduleAsync(
            masterId,
            customFrom,
            customTo,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldReturnAppointments_WhenTheyExistInTimeRange()
    {
        // Arrange
        var masterId = Guid.Parse("090307ba-6c7b-4d76-84e9-2176bb1b25ec");
        _userContextMock.Setup(x => x.Id).Returns(masterId);

        var service = (Service)Activator.CreateInstance(typeof(Service), true)!;
        SetPrivate(service, "Id", Guid.NewGuid());
        SetPrivate(service, "Title", "Масаж спини та шиї");
        SetPrivate(service, "Price", 2000m);
        SetPrivate(service, "Duration", 60);

        var masterUser = Domain.Entities.User.CreateRegistered("Oleg", "Master", "oleg@test.com", "hash", "+380");
        var master = (Domain.Entities.Master)Activator.CreateInstance(typeof(Domain.Entities.Master), true)!;
        SetPrivate(master, "Id", masterId);
        SetPrivate(master, "User", masterUser);

        // FIX: Wire the master object you created up to the mock!
        _masterRepoMock.Setup(x => x.GetByUserIdAsync(masterId, It.IsAny<CancellationToken>())).ReturnsAsync(master);
        _masterRepoMock.Setup(x => x.GetByIdAsync(masterId, It.IsAny<CancellationToken>())).ReturnsAsync(master);

        var clientUser = Domain.Entities.User.CreateRegistered("test", "test", "client@test.com", "hash", "+38099");
        SetPrivate(clientUser, "Id", Guid.NewGuid());

        var appointment = (Domain.Entities.Appointment)Activator.CreateInstance(typeof(Domain.Entities.Appointment), true)!;
        SetPrivate(appointment, "Id", Guid.NewGuid());
        SetPrivate(appointment, "MasterId", masterId);
        SetPrivate(appointment, "ClientId", clientUser.Id);
        SetPrivate(appointment, "StartTime", new DateTime(2026, 3, 11, 15, 0, 0, DateTimeKind.Utc));
        SetPrivate(appointment, "EndTime", new DateTime(2026, 3, 11, 16, 0, 0, DateTimeKind.Utc));
        SetPrivate(appointment, "Status", AppointmentStatus.Confirmed);
        SetPrivate(appointment, "Service", service);
        SetPrivate(appointment, "Client", clientUser);
        SetPrivate(appointment, "Master", master);

        var expectedFrom = new DateTime(2026, 3, 11, 0, 0, 0, DateTimeKind.Utc);
        var expectedTo = expectedFrom.AddDays(7);

        _appointmentRepoMock
            .Setup(x => x.GetMasterScheduleAsync(masterId, expectedFrom, expectedTo, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Appointment> { appointment });

        // Act
        var result = await _handler.Handle(new GetMasterScheduleQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].ClientFirstName.Should().Be("test");
        result.Value[0].ServiceName.Should().Be("Масаж спини та шиї");
        result.Value[0].StartTime.Hour.Should().Be(15);
    }

    private void SetPrivate(object obj, string propertyName, object value)
    {
        var type = obj.GetType();
        var prop = type.GetProperty(propertyName, BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);

        if (prop != null && prop.CanWrite)
        {
            prop.SetValue(obj, value);
        }
        else
        {
            var field = type.GetField($"<{propertyName}>k__BackingField", BindingFlags.NonPublic | BindingFlags.Instance);
            if (field != null)
            {
                field.SetValue(obj, value);
            }
        }
    }
}
