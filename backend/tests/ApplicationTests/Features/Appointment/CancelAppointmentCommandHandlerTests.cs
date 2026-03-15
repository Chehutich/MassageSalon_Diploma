using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.Appointments.CancelAppointment;
using Domain.Entities;
using Domain.Enums;
using Domain.Errors;
using FluentAssertions;
using MediatR;
using Moq;

namespace ApplicationTests.Features.Appointment;

public class CancelAppointmentCommandHandlerTests
{
    private readonly Mock<IAppointmentRepository> _appointmentRepoMock;
    private readonly Mock<ICurrentUserContext> _currentUserContextMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<TimeProvider> _timeProviderMock;
    private readonly CancelAppointmentCommandHandler _handler;

    public CancelAppointmentCommandHandlerTests()
    {
        _appointmentRepoMock = new Mock<IAppointmentRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _timeProviderMock = new Mock<TimeProvider>();
        _currentUserContextMock = new Mock<ICurrentUserContext>();

        _handler = new CancelAppointmentCommandHandler(
            _appointmentRepoMock.Object,
            _unitOfWorkMock.Object,
            _currentUserContextMock.Object,
            _timeProviderMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenAppointmentDoesNotExist()
    {
        // Arrange
        var command = new CancelAppointmentCommand(Guid.NewGuid());

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
    public async Task Handle_ShouldReturnTooLate_WhenCancelingLessThan1HourAway()
    {
        // Arrange
        var appointmentId = Guid.NewGuid();
        var command = new CancelAppointmentCommand(appointmentId);

        var now = DateTime.UtcNow;

        var startTime = now.AddMinutes(30);

        var service = new Service(Guid.NewGuid(), "service", "Haircut", "Desc", 60, 100m);

        var appointment = (Domain.Entities.Appointment)Activator.CreateInstance(typeof(Domain.Entities.Appointment), true)!;
        typeof(Domain.Entities.Appointment).GetProperty(nameof(Domain.Entities.Appointment.Id))?.SetValue(appointment, appointmentId);
        typeof(Domain.Entities.Appointment).GetProperty(nameof(Domain.Entities.Appointment.StartTime))?.SetValue(appointment, startTime);
        typeof(Domain.Entities.Appointment).GetProperty(nameof(Domain.Entities.Appointment.Status))?.SetValue(appointment, AppointmentStatus.Confirmed);

        _appointmentRepoMock.Setup(x => x.GetByIdAsync(appointmentId, It.IsAny<CancellationToken>())).ReturnsAsync(appointment);
        _timeProviderMock.Setup(x => x.GetUtcNow()).Returns(new DateTimeOffset(now));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();

        result.Error.Should().Be(Errors.Appointment.TooLateToCancel);
    }

    [Fact]
    public async Task Handle_ShouldCancelAppointment_WhenMoreThan1HourAway()
    {
        // Arrange
        var appointmentId = Guid.NewGuid();
        var command = new CancelAppointmentCommand(appointmentId);

        var now = DateTime.UtcNow;

        var startTime = now.AddHours(2);

        var appointment = (Domain.Entities.Appointment)Activator.CreateInstance(typeof(Domain.Entities.Appointment), true)!;
        typeof(Domain.Entities.Appointment).GetProperty(nameof(Domain.Entities.Appointment.Id))?.SetValue(appointment, appointmentId);
        typeof(Domain.Entities.Appointment).GetProperty(nameof(Domain.Entities.Appointment.StartTime))?.SetValue(appointment, startTime);
        typeof(Domain.Entities.Appointment).GetProperty(nameof(Domain.Entities.Appointment.Status))?.SetValue(appointment, AppointmentStatus.Confirmed);

        _appointmentRepoMock.Setup(x => x.GetByIdAsync(appointmentId, It.IsAny<CancellationToken>())).ReturnsAsync(appointment);
        _timeProviderMock.Setup(x => x.GetUtcNow()).Returns(new DateTimeOffset(now));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(Unit.Value);

        appointment.Status.Should().Be(AppointmentStatus.Cancelled);

        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
