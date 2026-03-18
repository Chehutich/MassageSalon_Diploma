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
    public async Task GetAllAsyncWithDetails_ShouldFilterMasters()
    {
        // Arrange
        var category = await CreateCategoryAsync("Body");
        var service1 = await CreateServiceAsync(category.Id, "Massage 1");
        var service2 = await CreateServiceAsync(category.Id, "Massage 2");

        var user1 = await CreateUserAsync("m1@test.com", "+111");
        var user2 = await CreateUserAsync("m2@test.com", "+222");

        var master1 = await CreateMasterAsync(user1);
        var master2 = await CreateMasterAsync(user2);


        master1.UpdateServices(new List<Service> { service1 });
        master2.UpdateServices(new List<Service> { service2 });

        await context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllWithDetailsAsync(service1.Id);

        // Assert
        result.Should().HaveCount(1);

        result.First().Id.Should().Be(master1.Id);
        result.First().User.Email.Should().Be("m1@test.com");
    }
}
