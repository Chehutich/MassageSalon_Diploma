using FluentAssertions;
using Infrastructure.Persistence.Repos;
using Xunit;

namespace InfrastructureTests.Repos;

public class ServiceRepositoryTests : BaseRepositoryTest
{
    private readonly ServiceRepository _repository;

    public ServiceRepositoryTests()
    {
        _repository = new ServiceRepository(context);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnServicesWithCategories()
    {
        // Arrange
        var category = await CreateCategoryAsync("SPA");
        await CreateServiceAsync(category.Id, "Massage");

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().NotBeEmpty();
        result[0].Category.Should().NotBeNull();
        result[0].Category.Title.Should().Be("SPA");
    }

    [Fact]
    public async Task GetAllAsync_ShouldNotReturnServices_WhenCategoryIsNotActive()
    {
        // Arrange
        var category = await CreateCategoryAsync("SPA", isActive: false);
        await CreateServiceAsync(category.Id, "Massage");

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().BeEmpty();
    }
}
