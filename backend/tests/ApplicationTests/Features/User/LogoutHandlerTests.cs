using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.User.Logout;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.User;

public class LogoutHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<ICurrentUserContext> _userContextMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly LogoutHandler _handler;

    public LogoutHandlerTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _userContextMock = new Mock<ICurrentUserContext>();
        _uowMock = new Mock<IUnitOfWork>();
        _handler = new LogoutHandler(_userRepoMock.Object, _userContextMock.Object, _uowMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ClearRefreshTokenInDatabase_WhenUserExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = Domain.Entities.User.CreateRegistered("Ivan", "Ivanov", "test@test.com", "hash", "+3800000000");
        user.SetRefreshToken("active_token", DateTime.UtcNow.AddDays(1));

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(new LogoutCommand(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        user.RefreshToken.Should().BeNull();
        user.RefreshTokenExpiry.Should().Be(null);

        _uowMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenUserNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.User?)null);

        // Act
        var result = await _handler.Handle(new LogoutCommand(), CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.NotFound");
        _uowMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
