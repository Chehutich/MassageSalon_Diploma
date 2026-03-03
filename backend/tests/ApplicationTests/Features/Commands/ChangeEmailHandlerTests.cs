using Application.Features.Commands.ChangeEmail;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Domain.Entities;
using FluentAssertions;
using Moq;
using Xunit;

namespace ApplicationTests.Features.Commands;

public class ChangeEmailHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<ICurrentUserContext> _userContextMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly ChangeEmailHandler _handler;

    public ChangeEmailHandlerTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _userContextMock = new Mock<ICurrentUserContext>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _uowMock = new Mock<IUnitOfWork>();

        _handler = new ChangeEmailHandler(
            _userRepoMock.Object,
            _userContextMock.Object,
            _passwordHasherMock.Object,
            _uowMock.Object);
    }

    [Fact]
    public async Task Handle_Should_UpdateEmail_When_PasswordIsValidAndEmailUnique()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User("Chechutich", "Test", "old@test.com", "hash", "+123");
        var command = new ChangeEmailCommand("new@test.com", "correct_password");

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);

        _passwordHasherMock.Setup(x => x.VerifyPassword(command.Password, user.PasswordHash)).Returns(true);

        _userRepoMock.Setup(x => x.GetByEmailAsync(command.NewEmail, It.IsAny<CancellationToken>())).ReturnsAsync((User?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        user.Email.Should().Be("new@test.com");
        user.RefreshToken.Should().BeNull();
        _uowMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_When_PasswordIsInvalid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User("Chechutich", "Test", "old@test.com", "hash", "+123");
        var command = new ChangeEmailCommand("new@test.com", "wrong_password");

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _passwordHasherMock.Setup(x => x.VerifyPassword(command.Password, user.PasswordHash)).Returns(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.InvalidPassword");
        user.Email.Should().Be("old@test.com");
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_When_EmailAlreadyExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User("Chechutich", "Test", "old@test.com", "hash", "+123");
        var anotherUser = new User("Busy", "User", "new@test.com", "hash", "+456");
        var command = new ChangeEmailCommand("new@test.com", "correct_password");

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _passwordHasherMock.Setup(x => x.VerifyPassword(command.Password, user.PasswordHash)).Returns(true);

        _userRepoMock.Setup(x => x.GetByEmailAsync(command.NewEmail, It.IsAny<CancellationToken>())).ReturnsAsync(anotherUser);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.DuplicateEmail");
    }
}
