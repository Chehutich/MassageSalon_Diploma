using Application.Common.Interfaces.Repos;
using Application.Features.Masters.GetMasterDetails;
using Domain.Entities;
using Domain.Errors;
using FluentAssertions;
using Moq;
using Xunit;

namespace ApplicationTests.Features.Masters;

public class GetMasterDetailsHandlerTests
{
    private readonly Mock<IMasterRepository> _masterRepoMock;
    private readonly GetMasterDetailsHandler _handler;

    public GetMasterDetailsHandlerTests()
    {
        _masterRepoMock = new Mock<IMasterRepository>();
        _handler = new GetMasterDetailsHandler(_masterRepoMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnMasterDetails_WhenMasterExists()
    {
        // Arrange
        var masterId = Guid.NewGuid();
        var category = new Category("Massage", "massage");
        var service = new Service(Guid.NewGuid(), "Classic", "Description", 60, 1000m);

        typeof(Service).GetProperty(nameof(Service.Category))?.SetValue(service, category);

        var user = new Domain.Entities.User("Hanna", "Kovalenko", "hanna@test.com", "hash", "+380");
        var master = new Master(user.Id, "Pro", "photo.jpg");

        typeof(Master).GetProperty(nameof(Master.Id))?.SetValue(master, masterId);
        typeof(Master).GetProperty(nameof(Master.User))?.SetValue(master, user);
        typeof(Master).GetProperty(nameof(Master.Services))?.SetValue(master, new List<Service> { service });

        _masterRepoMock.Setup(x => x.GetByIdWithDetailsAsync(masterId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(master);

        // Act
        var result = await _handler.Handle(new GetMasterDetailsQuery(masterId), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().Be(masterId);
        result.Value.FirstName.Should().Be("Hanna");
        result.Value.Services.Should().HaveCount(1);
        result.Value.Services.First().CategorySlug.Should().Be("massage");
        result.Value.Services.First().Title.Should().Be("Classic");
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenMasterDoesNotExist()
    {
        // Arrange
        var masterId = Guid.NewGuid();
        _masterRepoMock.Setup(x => x.GetByIdAsync(masterId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Master?)null);

        // Act
        var result = await _handler.Handle(new GetMasterDetailsQuery(masterId), CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.Master.NotFound(masterId));
    }

    [Fact]
    public async Task Handle_Should_ReturnDetailsWithEmptyServices_WhenMasterHasNoServices()
    {
        // Arrange
        var masterId = Guid.NewGuid();
        var user = new Domain.Entities.User("Ivan", "Test", "ivan@test.com", "hash", "+380");
        var master = new Master(user.Id, "Біо", null);

        typeof(Master).GetProperty(nameof(Master.Id))?.SetValue(master, masterId);
        typeof(Master).GetProperty(nameof(Master.User))?.SetValue(master, user);
        typeof(Master).GetProperty(nameof(Master.Services))?.SetValue(master, new List<Service>());

        _masterRepoMock.Setup(x => x.GetByIdWithDetailsAsync(masterId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(master);

        // Act
        var result = await _handler.Handle(new GetMasterDetailsQuery(masterId), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Services.Should().BeEmpty();
    }
}
