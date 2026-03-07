using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.Auth.RefreshToken;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Auth;

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
    public async Task Handle_Should_ReturnSuccess_EvenIfAccessTokenIsEmpty_ButRefreshTokenIsValid()
    {
        // Arrange
        var oldRefreshToken = "valid_refresh_token";
        // Access token is null, but refresh token is valid
        var command = new RefreshTokenCommand(string.Empty, oldRefreshToken);

        var user = new Domain.Entities.User("Ivan", "Ivanov", "test@test.com", "hash", "+3800000000");
        user.SetRefreshToken(oldRefreshToken, DateTime.UtcNow.AddDays(1));

        _userRepoMock.Setup(x => x.GetByRefreshTokenAsync(oldRefreshToken, It.IsAny<CancellationToken>()))
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

        _uowMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenRefreshTokenIsExpired()
    {
        // Arrange
        var token = "expired_token";
        var command = new RefreshTokenCommand("any_access", token);

        var user = new Domain.Entities.User("Ivan", "Ivanov", "test@test.com", "hash", "+3800000000");

        user.SetRefreshToken(token, DateTime.UtcNow.AddDays(1));
        typeof(Domain.Entities.User).GetProperty(nameof(user.RefreshTokenExpiry))?
            .SetValue(user, DateTime.UtcNow.AddSeconds(-1));

        _userRepoMock.Setup(x => x.GetByRefreshTokenAsync(token, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();

        result.Error.Code.Should().Be("Auth.InvalidRefreshToken");
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenUserNotFoundByRefreshToken()
    {
        // Arrange
        var command = new RefreshTokenCommand("any", "non_existent_token");

        _userRepoMock.Setup(x => x.GetByRefreshTokenAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.User?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.InvalidRefreshToken");
    }
}
