using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.User.GetMe;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.User;

public class GetMeHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<ICurrentUserContext> _userContextMock;
    private readonly GetMeHandler _handler;

    public GetMeHandlerTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _userContextMock = new Mock<ICurrentUserContext>();
        _handler = new GetMeHandler(_userRepoMock.Object, _userContextMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnUserResponse_WhenUserExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = Domain.Entities.User.CreateRegistered("Chechut", "Test", "Chechut@test.com", "hash", "+123456");

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(new GetMeQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Email.Should().Be("chechut@test.com");
        result.Value.FirstName.Should().Be("Chechut");
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenUserDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.User?)null);

        // Act
        var result = await _handler.Handle(new GetMeQuery(), CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.NotFound");
    }
}
