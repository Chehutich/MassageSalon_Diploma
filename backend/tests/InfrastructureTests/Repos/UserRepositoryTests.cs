using Domain.Entities;
using FluentAssertions;
using Infrastructure.Persistence.Repos;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace InfrastructureTests.Repos;

public class UserRepositoryTests : BaseRepositoryTest
{
    private readonly UserRepository _repository;

    public UserRepositoryTests()
    {
        _repository = new UserRepository(context);
    }

    [Fact]
    public async Task GetByEmailAsync_ShouldReturnUser_WhenUserExists()
    {
        // Arrange
        var user = await CreateUserAsync("Mykola@test.com");

        // Act
        var result = await _repository.GetByEmailAsync(user.Email);

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be(user.Email);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnUser_WhenUserExists()
    {
        // Arrange
        var user = await CreateUserAsync("Mykola@test.com");

        // Act
        var result = await _repository.GetByIdAsync(user.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be(user.Email);
    }

    [Fact]
    public async Task GetByPhoneAsync_ShouldReturnUser_WhenPhoneExists()
    {
        // Arrange
        var phone = "+380991112233";
        var user = await CreateUserAsync("oleg@test.com", phone);

        // Act
        var result = await _repository.GetByPhoneAsync(phone);

        // Assert
        result.Should().NotBeNull();
        result!.Phone.Should().Be(phone);
    }

    [Fact]
    public async Task AddAsync_ShouldAddUserToDatabase()
    {
        // Arrange
        var user = new User("Ruslan", "LastName", "Ruslan@test.com", "hash", "+3800000000");

        // Act
        await _repository.AddAsync(user);
        await context.SaveChangesAsync();

        // Assert
        var dbUser = await context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
        dbUser.Should().NotBeNull();
    }
}
