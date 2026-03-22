using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.Appointments.GetMyAppointments;
using Domain.Entities;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Appointment;

public class GetMyAppointmentsQueryHandlerTests
{
    private readonly Mock<IAppointmentRepository> _appointmentRepoMock;
    private readonly Mock<ICurrentUserContext> _userContextMock;
    private readonly GetMyAppointmentsQueryHandler _handler;

    public GetMyAppointmentsQueryHandlerTests()
    {
        _appointmentRepoMock = new Mock<IAppointmentRepository>();
        _userContextMock = new Mock<ICurrentUserContext>();
        _handler = new GetMyAppointmentsQueryHandler(_appointmentRepoMock.Object, _userContextMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnListOfDtos_WhenAppointmentsExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userContextMock.Setup(x => x.Id).Returns(userId);

        var service = new Service(Guid.NewGuid(), "service", "Massage", "Description", 60, 1000m);

        var masterUser = Domain.Entities.User.CreateRegistered("Oleg", "Test", "oleg@test.com", "123", "+380");
        var master = (Master)Activator.CreateInstance(typeof(Master), true)!;
        typeof(Master).GetProperty("Id")?.SetValue(master, Guid.NewGuid());
        typeof(Master).GetProperty("User")?.SetValue(master, masterUser);

        var appointment = new Domain.Entities.Appointment(
            userId,
            master.Id,
            service,
            DateTime.UtcNow.AddDays(1),
            "Be quite, please"
        );

        typeof(Domain.Entities.Appointment).GetProperty("Service")?.SetValue(appointment, service);
        typeof(Domain.Entities.Appointment).GetProperty("Master")?.SetValue(appointment, master);

        _appointmentRepoMock
            .Setup(x => x.GetByUserId(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Appointment> { appointment });

        // Act
        var result = await _handler.Handle(new GetMyAppointmentsQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);

        var dto = result.Value.First();
        dto.Id.Should().Be(appointment.Id);
        dto.ServiceName.Should().Be("Massage");
        dto.MasterFirstName.Should().Be("Oleg");
        dto.MasterLastName.Should().Be("Test");
        dto.ClientNotes.Should().Be("Be quite, please");
    }

    [Fact]
    public async Task Handle_ShouldReturnEmptyList_WhenNoAppointmentsFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userContextMock.Setup(x => x.Id).Returns(userId);

        _appointmentRepoMock
            .Setup(x => x.GetByUserId(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Appointment>());

        // Act
        var result = await _handler.Handle(new GetMyAppointmentsQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }
}
