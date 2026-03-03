using Application.Common.Intefaces;
using Application.Common.Intefaces.Repos;
using Application.Features.Commands.RefreshToken;
using Domain.Entities;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Commands;

public class RefreshTokenHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<IJwtTokenGenerator> _jwtMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly RefreshTokenHandler _handler;

    public RefreshTokenHandlerTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _jwtMock = new Mock<IJwtTokenGenerator>();
        _uowMock = new Mock<IUnitOfWork>();
        _handler = new RefreshTokenHandler(_userRepoMock.Object, _jwtMock.Object, _uowMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_WhenTokensAreValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User("Ivan", "Ivanov", "test@test.com", "hash", "+380...");
        var oldRefreshToken = "old_refresh_token";
        user.SetRefreshToken(oldRefreshToken, DateTime.UtcNow.AddDays(1));

        var command = new RefreshTokenCommand("expired_access", oldRefreshToken);

        _jwtMock.Setup(x => x.GetUserIdFromExpiredToken(command.AccessToken))
            .Returns(userId);

        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _jwtMock.Setup(x => x.GenerateToken(user)).Returns("new_access");
        _jwtMock.Setup(x => x.GenerateRefreshToken())
            .Returns(("new_refresh", DateTime.UtcNow.AddDays(7)));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Token.Should().Be("new_access");
        result.Value.RefreshToken.Should().Be("new_refresh");

        user.RefreshToken.Should().Be("new_refresh");
        _uowMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenAccessTokenIsInvalid()
    {
        // Arrange
        var command = new RefreshTokenCommand("invalid_access", "any_refresh");
        _jwtMock.Setup(x => x.GetUserIdFromExpiredToken(It.IsAny<string>()))
            .Returns((Guid?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.InvalidToken");
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenRefreshTokenDoesNotMatch()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User("Ivan", "Ivanov", "test@test.com", "hash", "+380...");
        user.SetRefreshToken("actual_refresh_in_db", DateTime.UtcNow.AddDays(1));

        var command = new RefreshTokenCommand("expired_access", "wrong_refresh_from_client");

        _jwtMock.Setup(x => x.GetUserIdFromExpiredToken(command.AccessToken)).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.InvalidRefreshToken");
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenRefreshTokenIsExpired()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User("Ivan", "Ivanov", "test@test.com", "hash", "+380...");
        var token = "token";

        typeof(User).GetProperty("RefreshTokenExpiry")?.SetValue(user, DateTime.UtcNow.AddDays(-1));

        var command = new RefreshTokenCommand("expired_access", token);

        _jwtMock.Setup(x => x.GetUserIdFromExpiredToken(command.AccessToken)).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.InvalidRefreshToken");
    }
}
