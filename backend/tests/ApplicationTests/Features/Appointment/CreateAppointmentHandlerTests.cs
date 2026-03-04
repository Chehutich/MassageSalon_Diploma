using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.Appointments.CreateAppointment;
using Domain.Entities;
using Domain.Errors;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Appointment;

public class CreateAppointmentHandlerTests
{
    private readonly Mock<IAppointmentRepository> _appointmentRepoMock;
    private readonly Mock<IServiceRepository> _serviceRepoMock;
    private readonly Mock<IMasterRepository> _masterRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ICurrentUserContext> _userContextMock;
    private readonly CreateAppointmentHandler _handler;

    public CreateAppointmentHandlerTests()
    {
        _appointmentRepoMock = new Mock<IAppointmentRepository>();
        _serviceRepoMock = new Mock<IServiceRepository>();
        _masterRepoMock = new Mock<IMasterRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _userContextMock = new Mock<ICurrentUserContext>();

        _handler = new CreateAppointmentHandler(
            _appointmentRepoMock.Object,
            _serviceRepoMock.Object,
            _masterRepoMock.Object,
            _unitOfWorkMock.Object,
            _userContextMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenServiceDoesNotExist()
    {
        // Arrange
        var command = new CreateAppointmentCommand(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddDays(1));

        _serviceRepoMock
            .Setup(x => x.GetByIdAsync(command.ServiceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Service?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.Service.NotFound(command.ServiceId));
    }

    [Fact]
    public async Task Handle_ShouldReturnConflict_WhenMasterIsNotAvailable()
    {
        // Arrange
        var command = new CreateAppointmentCommand(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddDays(1));

        var service = new Service(command.ServiceId, "Haircut", "Desc", 60, 100m);

        _serviceRepoMock
            .Setup(x => x.GetByIdAsync(command.ServiceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);

        _masterRepoMock
            .Setup(x => x.IsMasterAvailableAsync(
                command.MasterId,
                command.StartTime,
                command.StartTime.AddMinutes(service.Duration),
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.Appointment.Conflict);
    }

    [Fact]
    public async Task Handle_ShouldCreateAppointment_WhenAllConditionsAreMet()
    {
        // Arrange
        var clientId = Guid.NewGuid();
        var command = new CreateAppointmentCommand(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddDays(1), "Some notes");
        var service = new Service(command.ServiceId, "Haircut", "Desc", 60, 100m);

        _userContextMock.Setup(x => x.Id).Returns(clientId);

        _serviceRepoMock
            .Setup(x => x.GetByIdAsync(command.ServiceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);

        _masterRepoMock
            .Setup(x => x.IsMasterAvailableAsync(
                command.MasterId,
                command.StartTime,
                command.StartTime.AddMinutes(service.Duration),
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _appointmentRepoMock.Verify(x => x.AddAsync(
                It.IsAny<Domain.Entities.Appointment>(),
                It.IsAny<CancellationToken>()),
            Times.Once);

        _appointmentRepoMock.Verify(x => x.AddAsync(
                It.Is<Domain.Entities.Appointment>(a =>
                    a.ClientId == clientId &&
                    a.MasterId == command.MasterId &&
                    a.ServiceId == service.Id &&
                    a.StartTime == command.StartTime &&
                    a.ClientNotes == command.Notes),
                It.IsAny<CancellationToken>()),
            Times.Once);

        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
