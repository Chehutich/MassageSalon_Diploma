using Application.Common.Intefaces;
using Application.Common.Intefaces.Repos;
using Application.Features.Commands.Login;
using Domain.Entities;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Commands;

public class LoginCommandHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtTokenGenerator> _jwtTokenGeneratorMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly LoginCommandHandler _handler;

    public LoginCommandHandlerTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new LoginCommandHandler(_userRepositoryMock.Object, _passwordHasherMock.Object,
            _jwtTokenGeneratorMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenUserDoesNotExist()
    {
        // Arrange
        var query = new LoginCommand("notfound@test.com", "password123");
        _userRepositoryMock.Setup(x => x.GetByEmailAsync(query.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.InvalidCredentials");
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenPasswordIsIncorrect()
    {
        // Arrange
        var query = new LoginCommand("user@test.com", "wrong_password");
        var user = new User("Ivan", "Ivanov", query.Email, "correct_hash", "+380990000000");

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(query.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _passwordHasherMock.Setup(x => x.VerifyPassword(query.Password, user.PasswordHash))
            .Returns(false);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.InvalidCredentials");
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_WhenCredentialsAreValid()
    {
        // Arrange
        var query = new LoginCommand("user@test.com", "correct_password");
        var user = new User("Ivan", "Ivanov", query.Email, "correct_hash", "+380990000000");

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(query.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _passwordHasherMock.Setup(x => x.VerifyPassword(query.Password, user.PasswordHash))
            .Returns(true);

        _jwtTokenGeneratorMock.Setup(x => x.GenerateToken(user)).Returns("access_token");
        _jwtTokenGeneratorMock.Setup(x => x.GenerateRefreshToken())
            .Returns(("refresh_token", DateTime.UtcNow.AddDays(7)));

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Token.Should().Be("access_token");
        result.Value.RefreshToken.Should().Be("refresh_token");

        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
