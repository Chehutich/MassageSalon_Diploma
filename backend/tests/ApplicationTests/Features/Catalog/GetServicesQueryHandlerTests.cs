using Application.Common.Interfaces.Repos;
using Application.Features.Catalog.GetServices;
using Domain.Entities;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Catalog;

public class GetServicesQueryHandlerTests
{
    private readonly Mock<IServiceRepository> _serviceRepositoryMock;
    private readonly GetServicesQueryHandler _handler;

    public GetServicesQueryHandlerTests()
    {
        _serviceRepositoryMock = new Mock<IServiceRepository>();
        _handler = new GetServicesQueryHandler(_serviceRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnMappedServiceResponses_WhenServicesExist()
    {
        // Arrange
        var categoryId = Guid.NewGuid();
        var category = new Category("Massage");

        var service = new Service(
            categoryId,
            "Classical Massage",
            "Description",
            60,
            1500m);

        typeof(Service).GetProperty(nameof(Service.Category))?.SetValue(service, category);
        typeof(Service).GetProperty(nameof(Service.Id))?.SetValue(service, Guid.NewGuid());

        var servicesList = new List<Service> { service };

        _serviceRepositoryMock
            .Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(servicesList);

        var query = new GetServicesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);

        var response = result.Value.First();
        response.Title.Should().Be("Classical Massage");
        response.CategoryName.Should().Be("Massage");
        response.Price.Should().Be(1500m);
    }

    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenNoServicesFound()
    {
        // Arrange
        _serviceRepositoryMock
            .Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Service>());

        var query = new GetServicesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }
}
