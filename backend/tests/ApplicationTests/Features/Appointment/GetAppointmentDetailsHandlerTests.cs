using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.Appointments.GetAppointmentDetails;
using Domain.Entities;
using Domain.Enums;
using Domain.Errors;
using FluentAssertions;
using Moq;
using Xunit;

namespace ApplicationTests.Features.Appointment;

public class GetAppointmentDetailsHandlerTests
{
    private readonly Mock<IAppointmentRepository> _appointmentRepoMock;
    private readonly Mock<ICurrentUserContext> _userContextMock;
    private readonly GetAppointmentDetailsHandler _handler;

    public GetAppointmentDetailsHandlerTests()
    {
        _appointmentRepoMock = new Mock<IAppointmentRepository>();
        _userContextMock = new Mock<ICurrentUserContext>();
        _handler = new GetAppointmentDetailsHandler(_appointmentRepoMock.Object, _userContextMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnDetails_WhenAppointmentExistsAndBelongsToUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var appointmentId = Guid.NewGuid();
        var query = new GetAppointmentDetailsQuery(appointmentId);

        _userContextMock.Setup(x => x.Id).Returns(userId);

        var service = new Service(Guid.NewGuid(), "service", "Massage", "Description", 60, 1000m);

        var masterUser = Domain.Entities.User.CreateRegistered("Oleg", "Master", "oleg@test.com", "123", "+380");
        var master = (Master)Activator.CreateInstance(typeof(Master), true)!;
        typeof(Master).GetProperty("Id")?.SetValue(master, Guid.NewGuid());
        typeof(Master).GetProperty("User")?.SetValue(master, masterUser);

        var clientUser =
            Domain.Entities.User.CreateRegistered("Ivan", "Client", "ivan@test.com", "123", "+380991112233");
        typeof(Domain.Entities.User).GetProperty("Id")?.SetValue(clientUser, userId);

        var appointment =
            (Domain.Entities.Appointment)Activator.CreateInstance(typeof(Domain.Entities.Appointment), true)!;
        typeof(Domain.Entities.Appointment).GetProperty("Id")?.SetValue(appointment, appointmentId);
        typeof(Domain.Entities.Appointment).GetProperty("ClientId")?.SetValue(appointment, userId);
        typeof(Domain.Entities.Appointment).GetProperty("Client")?.SetValue(appointment, clientUser);
        typeof(Domain.Entities.Appointment).GetProperty("StartTime")?.SetValue(appointment, DateTime.UtcNow);
        typeof(Domain.Entities.Appointment).GetProperty("EndTime")
            ?.SetValue(appointment, DateTime.UtcNow.AddMinutes(60));
        typeof(Domain.Entities.Appointment).GetProperty("Status")?.SetValue(appointment, AppointmentStatus.Confirmed);
        typeof(Domain.Entities.Appointment).GetProperty("Service")?.SetValue(appointment, service);
        typeof(Domain.Entities.Appointment).GetProperty("Master")?.SetValue(appointment, master);

        _appointmentRepoMock
            .Setup(x => x.GetByIdWithDetailsAsync(appointmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(appointment);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().Be(appointmentId);
        result.Value.ClientFirstName.Should().Be("Ivan");
        result.Value.MasterFirstName.Should().Be("Oleg");
        result.Value.ServiceName.Should().Be("Massage");
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenAppointmentIsFromAnotherUser()
    {
        // Arrange
        var currentUserId = Guid.NewGuid();
        var someoneElseId = Guid.NewGuid();
        var appointmentId = Guid.NewGuid();

        _userContextMock.Setup(x => x.Id).Returns(currentUserId);

        var appointment =
            (Domain.Entities.Appointment)Activator.CreateInstance(typeof(Domain.Entities.Appointment), true)!;
        typeof(Domain.Entities.Appointment).GetProperty("Id")?.SetValue(appointment, appointmentId);
        typeof(Domain.Entities.Appointment).GetProperty("ClientId")?.SetValue(appointment, someoneElseId);

        _appointmentRepoMock
            .Setup(x => x.GetByIdWithDetailsAsync(appointmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(appointment);

        // Act
        var result = await _handler.Handle(new GetAppointmentDetailsQuery(appointmentId), CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.Appointment.NotFound(appointmentId));
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenAppointmentDoesNotExist()
    {
        // Arrange
        var appointmentId = Guid.NewGuid();
        _appointmentRepoMock
            .Setup(x => x.GetByIdWithDetailsAsync(appointmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Appointment?)null);

        // Act
        var result = await _handler.Handle(new GetAppointmentDetailsQuery(appointmentId), CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.Appointment.NotFound(appointmentId));
    }
}
