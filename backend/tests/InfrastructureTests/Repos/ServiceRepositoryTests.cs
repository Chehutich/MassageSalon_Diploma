using Domain.Entities;
using Infrastructure.Persistence.Repos;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
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
        var category = new Category("SPA");
        await context.Categories.AddAsync(category);
        await context.SaveChangesAsync();

        var service = new Service(category.Id, "Massage", "Classical Massage", 30, 500m);

        await context.Services.AddAsync(service);
        await context.SaveChangesAsync();

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
        var category = new Category("SPA");
        category.Deactivate();
        await context.Categories.AddAsync(category);
        await context.SaveChangesAsync();

        var service = new Service(category.Id, "Massage", "Classical Massage", 30, 500m);

        await context.Services.AddAsync(service);
        await context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().BeEmpty();
    }
}
