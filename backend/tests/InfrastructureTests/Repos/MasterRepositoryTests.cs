using Domain.Entities;
using FluentAssertions;
using Infrastructure.Persistence.Repos;
using Xunit;

namespace InfrastructureTests.Repos;

public class MasterRepositoryTests : BaseRepositoryTest
{
    private readonly MasterRepository _repository;

    public MasterRepositoryTests()
    {
        _repository = new MasterRepository(context);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnActiveMastersWithUsers()
    {
        // Arrange
        var user = new User("John", "Doe", "john@test.com", "hash", "+1234567890");
        var master = new Master(user.Id, "Expert bio", null);

        context.Users.Add(user);
        context.Masters.Add(master);
        await context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(1);
        result.First().User.FirstName.Should().Be("John");
        result.First().Bio.Should().Be("Expert bio");
    }

    [Fact]
    public async Task GetAllAsync_WithServiceId_ShouldFilterMasters()
    {
        // Arrange
        var category = new Category("Body");
        var service1 = new Service(category.Id, "Massage 1", "Desc", 60, 1000m);
        var service2 = new Service(category.Id, "Massage 2", "Desc", 60, 1000m);

        var user1 = new User("Master", "One", "m1@test.com", "hash", "+111");
        var user2 = new User("Master", "Two", "m2@test.com", "hash", "+222");

        var master1 = new Master(user1.Id, null, null);
        var master2 = new Master(user2.Id, null, null);

        master1.UpdateServices(new List<Service> { service1 });
        master2.UpdateServices(new List<Service> { service2 });

        context.Categories.Add(category);
        context.Services.AddRange(service1, service2);
        context.Users.AddRange(user1, user2);
        context.Masters.AddRange(master1, master2);
        await context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync(service1.Id);

        // Assert
        result.Should().HaveCount(1);
        result.First().User.FirstName.Should().Be("Master");
    }
}
