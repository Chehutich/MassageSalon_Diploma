using Application.Common.Intefaces;
using Application.Common.Intefaces.Repos;
using Application.Features.Commands.ChangePassword;
using Domain.Entities;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Commands;

public class ChangePasswordHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<ICurrentUserContext> _userContextMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly ChangePasswordHandler _handler;

    public ChangePasswordHandlerTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _userContextMock = new Mock<ICurrentUserContext>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _uowMock = new Mock<IUnitOfWork>();
        _handler = new ChangePasswordHandler(_userRepoMock.Object, _userContextMock.Object, _passwordHasherMock.Object, _uowMock.Object);
    }

    [Fact]
    public async Task Handle_Should_UpdatePassword_When_OldPasswordIsCorrect()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User("Chechutich", "Test", "test@test.com", "old_hash", "+123");
        var command = new ChangePasswordCommand("old_pass", "new_pass");

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _passwordHasherMock.Setup(x => x.VerifyPassword("old_pass", "old_hash")).Returns(true);
        _passwordHasherMock.Setup(x => x.HashPassword("new_pass")).Returns("new_hash");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        user.PasswordHash.Should().Be("new_hash");
        user.RefreshToken.Should().BeNull();
        _uowMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_When_OldPasswordIsIncorrect()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User("Chechutich", "Test", "test@test.com", "old_hash", "+123");
        var command = new ChangePasswordCommand("wrong_pass", "new_pass");

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _passwordHasherMock.Setup(x => x.VerifyPassword("wrong_pass", "old_hash")).Returns(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.InvalidPassword");
        _uowMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
