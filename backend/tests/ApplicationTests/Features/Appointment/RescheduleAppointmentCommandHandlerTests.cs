using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.Appointments.RescheduleAppointment;
using Domain.Entities;
using Domain.Errors;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Appointment;

public class RescheduleAppointmentCommandHandlerTests
{
    private readonly Mock<IAppointmentRepository> _appointmentRepoMock;
    private readonly Mock<IMasterRepository> _masterRepoMock;
    private readonly Mock<ICurrentUserContext> _currentUserContextMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<TimeProvider> _timeProviderMock;
    private readonly RescheduleAppointmentCommandHandler _handler;

    public RescheduleAppointmentCommandHandlerTests()
    {
        _appointmentRepoMock = new Mock<IAppointmentRepository>();
        _currentUserContextMock = new Mock<ICurrentUserContext>();
        _masterRepoMock = new Mock<IMasterRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _timeProviderMock = new Mock<TimeProvider>();

        _handler = new RescheduleAppointmentCommandHandler(
            _appointmentRepoMock.Object,
            _currentUserContextMock.Object,
            _masterRepoMock.Object,
            _unitOfWorkMock.Object,
            _timeProviderMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenAppointmentDoesNotExist()
    {
        // Arrange
        var command = new RescheduleAppointmentCommand(Guid.NewGuid(), DateTime.UtcNow.AddDays(2));

        _appointmentRepoMock
            .Setup(x => x.GetByIdAsync(command.AppointmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Appointment?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.Appointment.NotFound(command.AppointmentId));
    }

    [Fact]
    public async Task Handle_ShouldReturnConflict_WhenMasterIsNotAvailable()
    {
        // Arrange
        var appointmentId = Guid.NewGuid();
        var masterId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var command = new RescheduleAppointmentCommand(appointmentId, DateTime.UtcNow.AddDays(2));

        var service = new Service(Guid.NewGuid(), "service", "Haircut", "Desc", 60, 100m);
        var appointment = new Domain.Entities.Appointment(userId, masterId, service, DateTime.UtcNow.AddDays(3), null);

        typeof(Domain.Entities.Appointment).GetProperty(nameof(Domain.Entities.Appointment.Service))?.SetValue(appointment, service);
        typeof(Domain.Entities.Appointment).GetProperty(nameof(Domain.Entities.Appointment.Id))?.SetValue(appointment, appointmentId);

        _appointmentRepoMock
            .Setup(x => x.GetByIdAsync(appointmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(appointment);

        _masterRepoMock
            .Setup(x => x.IsMasterAvailableAsync(masterId, command.NewStartTime, command.NewStartTime.AddMinutes(service.Duration), appointmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _currentUserContextMock.Setup(x => x.Id).Returns(userId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.Appointment.Conflict);
    }

    [Fact]
    public async Task Handle_ShouldReturnTooLate_WhenReschedulingLessThan24HoursAway()
    {
        // Arrange
        var appointmentId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var command = new RescheduleAppointmentCommand(appointmentId, DateTime.UtcNow.AddDays(2));

        var now = DateTime.UtcNow;
        var oldStartTime = now.AddHours(10);

        var service = new Service(userId, "service", "Haircut", "Desc", 60, 100m);

        var appointment = new Domain.Entities.Appointment(userId, Guid.NewGuid(), service, oldStartTime, null);
        typeof(Domain.Entities.Appointment).GetProperty(nameof(Domain.Entities.Appointment.Service))?.SetValue(appointment, service);

        _appointmentRepoMock.Setup(x => x.GetByIdAsync(appointmentId, It.IsAny<CancellationToken>())).ReturnsAsync(appointment);
        _masterRepoMock.Setup(x => x.IsMasterAvailableAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _currentUserContextMock.Setup(x => x.Id).Returns(userId);
        _timeProviderMock.Setup(x => x.GetUtcNow()).Returns(new DateTimeOffset(now));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.Appointment.TooLateToReschedule);
    }

    [Fact]
    public async Task Handle_ShouldReschedule_WhenAllConditionsAreMet()
    {
        // Arrange
        var appointmentId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var userId = Guid.NewGuid();
        var oldStartTime = now.AddDays(2);
        var newStartTime = now.AddDays(3);

        var command = new RescheduleAppointmentCommand(appointmentId, newStartTime);
        var service = new Service(Guid.NewGuid(), "service", "Haircut", "Desc", 60, 100m);
        var appointment = new Domain.Entities.Appointment(userId, Guid.NewGuid(), service, oldStartTime, null);

        typeof(Domain.Entities.Appointment).GetProperty(nameof(Domain.Entities.Appointment.Service))?.SetValue(appointment, service);
        typeof(Domain.Entities.Appointment).GetProperty(nameof(Domain.Entities.Appointment.Id))?.SetValue(appointment, appointmentId);

        _appointmentRepoMock.Setup(x => x.GetByIdAsync(appointmentId, It.IsAny<CancellationToken>())).ReturnsAsync(appointment);
        _masterRepoMock.Setup(x => x.IsMasterAvailableAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _timeProviderMock.Setup(x => x.GetUtcNow()).Returns(new DateTimeOffset(now));
        _currentUserContextMock.Setup(x => x.Id).Returns(userId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(appointmentId);

        appointment.StartTime.Should().Be(newStartTime);
        appointment.EndTime.Should().Be(newStartTime.AddMinutes(service.Duration));

        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
