using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.User.ChangePhone;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.User;

public class ChangePhoneHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<ICurrentUserContext> _userContextMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly ChangePhoneHandler _handler;

    public ChangePhoneHandlerTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _userContextMock = new Mock<ICurrentUserContext>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _uowMock = new Mock<IUnitOfWork>();
        _handler = new ChangePhoneHandler(_userRepoMock.Object, _userContextMock.Object, _passwordHasherMock.Object, _uowMock.Object);
    }

    [Fact]
    public async Task Handle_Should_UpdatePhone_When_Valid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new Domain.Entities.User("Chehutich", "Test", "t@t.com", "hash", "+111");
        var command = new ChangePhoneCommand("+222", "pass");

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _passwordHasherMock.Setup(x => x.VerifyPassword("pass", "hash")).Returns(true);
        _userRepoMock.Setup(x => x.GetByPhoneAsync("+222", It.IsAny<CancellationToken>())).ReturnsAsync((Domain.Entities.User?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        user.Phone.Should().Be("+222");
        user.RefreshToken.Should().BeNull();
    }
}
