using Application.Common.Interfaces.Repos;
using Application.Features.Catalog.GetServiceById;
using Domain.Entities;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Catalog;

public class GetServiceByIdHandlerTests
{
    private readonly Mock<IServiceRepository> _serviceRepoMock;
    private readonly Mock<IMasterRepository> _masterRepoMock;
    private readonly GetServiceByIdHandler _handler;

    public GetServiceByIdHandlerTests()
    {
        _serviceRepoMock = new Mock<IServiceRepository>();
        _masterRepoMock = new Mock<IMasterRepository>();
        _handler = new GetServiceByIdHandler(_serviceRepoMock.Object, _masterRepoMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnServiceWithMastersAndBenefits_WhenExists()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        var category = new Category("Body", "massage");
        var service = new Service(Guid.NewGuid(), "service", "Oil Massage", "Deep relax", 60, 2000m,
            new List<string> { "Deep relax", "Relax" });

        typeof(Service).GetProperty(nameof(Service.Id))?.SetValue(service, serviceId);
        typeof(Service).GetProperty(nameof(Service.Category))?.SetValue(service, category);

        var user = Domain.Entities.User.CreateRegistered("John", "Doe", "john@test.com", "hash", "+123456");
        var master = new Master(user.Id, "Expert in Oil massage");
        typeof(Master).GetProperty(nameof(Master.User))?.SetValue(master, user);

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);
        _masterRepoMock.Setup(x => x.GetAllWithDetailsAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Master> { master });

        // Act
        var result = await _handler.Handle(new GetServiceByIdQuery(serviceId), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Title.Should().Be("Oil Massage");
        result.Value.Benefits.Should().HaveCount(2);
        result.Value.Masters.Should().HaveCount(1);
        result.Value.Masters.First().FirstName.Should().Be("John");
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenServiceDoesNotExist()
    {
        // Arrange
        var serviceId = Guid.NewGuid();

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Service?)null);

        // Act
        var result = await _handler.Handle(new GetServiceByIdQuery(serviceId), CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Service.NotFound");

        _masterRepoMock.Verify(x => x.GetAllWithDetailsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnServiceWithEmptyMastersList_WhenNoMastersAssigned()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        var category = new Category("Body", "massage");
        var service = new Service(Guid.NewGuid(), "service", "Zen Massage", "Relax", 60, 3000m);

        typeof(Service).GetProperty(nameof(Service.Id))?.SetValue(service, serviceId);
        typeof(Service).GetProperty(nameof(Service.Category))?.SetValue(service, category);

        _serviceRepoMock.Setup(x => x.GetByIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);

        _masterRepoMock.Setup(x => x.GetAllWithDetailsAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Master>());

        // Act
        var result = await _handler.Handle(new GetServiceByIdQuery(serviceId), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Title.Should().Be("Zen Massage");
        result.Value.Masters.Should().BeEmpty();
    }
}
