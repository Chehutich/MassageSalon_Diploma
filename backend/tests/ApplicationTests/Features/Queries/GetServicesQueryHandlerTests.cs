using Application.Common.Interfaces;
using Application.Features.Queries.GetServices;
using Domain.Entities;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Queries;

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
            .Setup(x => x.GetAllAsync(null, It.IsAny<CancellationToken>()))
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
            .Setup(x => x.GetAllAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Service>());

        var query = new GetServicesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_Should_CallRepositoryWithCategoryId_WhenFilterIsProvided()
    {
        // Arrange
        var targetCategoryId = Guid.NewGuid();
        var otherCategoryId = Guid.NewGuid();

        var category = new Category("Target Category");
        var service = new Service(targetCategoryId, "Filtered Service", "Desc", 30, 500m);

        typeof(Service).GetProperty(nameof(Service.Category))?.SetValue(service, category);

        _serviceRepositoryMock
            .Setup(x => x.GetAllAsync(targetCategoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Service> { service });

        var query = new GetServicesQuery(targetCategoryId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value.First().Title.Should().Be("Filtered Service");

        _serviceRepositoryMock.Verify(x => x.GetAllAsync(targetCategoryId, It.IsAny<CancellationToken>()), Times.Once);
    }
}
