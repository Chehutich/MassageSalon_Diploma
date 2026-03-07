using Application.Common.Interfaces.Repos;
using Application.Features.Masters.GetMasters;
using Domain.Entities;
using FluentAssertions;
using Moq;
using Xunit;

namespace ApplicationTests.Features.Masters;

public class GetMastersHandlerTests
{
    private readonly Mock<IMasterRepository> _masterRepoMock;
    private readonly GetMastersHandler _handler;

    public GetMastersHandlerTests()
    {
        _masterRepoMock = new Mock<IMasterRepository>();
        _handler = new GetMastersHandler(_masterRepoMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnMastersWithDistinctCategories_WhenMastersExist()
    {
        // Arrange
        var category = new Category("Massage", "massage");
        var service1 = new Service(Guid.NewGuid(), "Tai", "...", 60, 1000m);
        var service2 = new Service(Guid.NewGuid(), "Health", "...", 60, 1200m);

        typeof(Service).GetProperty(nameof(Service.Category))?.SetValue(service1, category);
        typeof(Service).GetProperty(nameof(Service.Category))?.SetValue(service2, category);

        var user = new Domain.Entities.User("Ivan", "Test", "ivan@test.com", "hash", "+123");
        var master = new Master(user.Id, "Pro", null);

        typeof(Master).GetProperty(nameof(Master.User))?.SetValue(master, user);
        typeof(Master).GetProperty(nameof(Master.Services))?.SetValue(master, new List<Service> { service1, service2 });

        _masterRepoMock.Setup(x => x.GetAllWithDetailsAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Master> { master });

        // Act
        var result = await _handler.Handle(new GetMastersQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);

        result.Value.First().ServiceCategories.Should().HaveCount(1);
        result.Value.First().FirstName.Should().Be("Ivan");
    }

    [Fact]
    public async Task Handle_Should_CallRepoWithServiceId_WhenFilterProvided()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        var query = new GetMastersQuery(serviceId);

        _masterRepoMock.Setup(x => x.GetAllWithDetailsAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Master>());

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _masterRepoMock.Verify(x => x.GetAllWithDetailsAsync(serviceId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenNoMastersFound()
    {
        // Arrange
        _masterRepoMock.Setup(x => x.GetAllWithDetailsAsync(It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Master>());

        // Act
        var result = await _handler.Handle(new GetMastersQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }
}
