using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.Auth.Register;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Auth;

public class RegisterCommandHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtTokenGenerator> _jwtTokenGeneratorMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly RegisterCommandHandler _handler;

    public RegisterCommandHandlerTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new RegisterCommandHandler(_userRepositoryMock.Object, _passwordHasherMock.Object,
            _jwtTokenGeneratorMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenEmailIsNotUnique()
    {
        // Arrange
        var command = new RegisterCommand("Ivan", "Ivanov", "existing@test.com", "password123", "+380000000000");

        var existingUser = Domain.Entities.User.CreateRegistered("Old", "User", command.Email, "hash", "+380000000000");

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.DuplicateEmail");
        _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Domain.Entities.User>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenPhoneIsNotUnique()
    {
        // Arrange
        var command = new RegisterCommand("Ivan", "Ivanov", "new@test.com", "password123", "+380991112233");
        var existingUserByPhone =
            Domain.Entities.User.CreateRegistered("Other", "User", "other@test.com", "hash", command.Phone);

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.User?)null);
        _userRepositoryMock.Setup(x => x.GetByPhoneAsync(command.Phone, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUserByPhone);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.DuplicatePhone");
    }

    [Fact]
    public async Task Handle_Should_RegisterUser_WhenDataIsUnique()
    {
        // Arrange
        var command = new RegisterCommand("Ivan", "Ivanov", "clean@test.com", "password123", "+380990000000");

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.User?)null);
        _userRepositoryMock.Setup(x => x.GetByPhoneAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.User?)null);

        _passwordHasherMock.Setup(x => x.HashPassword(It.IsAny<string>())).Returns("hashed_pass");
        _jwtTokenGeneratorMock.Setup(x => x.GenerateToken(It.IsAny<Domain.Entities.User>())).Returns("access_token");
        _jwtTokenGeneratorMock.Setup(x => x.GenerateRefreshToken())
            .Returns(("refresh_token", DateTime.UtcNow.AddDays(7)));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Token.Should().Be("access_token");

        _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Domain.Entities.User>(), It.IsAny<CancellationToken>()),
            Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_UpgradeGuest_WhenUserExistsAsGuest()
    {
        // Arrange
        var command = new RegisterCommand("Ivan", "Ivanov", "upgrade@test.com", "password123", "+380991112233");

        var existingGuestUser = Domain.Entities.User.CreateGuest("GuestName", "GuestLastName", command.Phone);

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.User?)null);

        _userRepositoryMock.Setup(x => x.GetByPhoneAsync(command.Phone, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingGuestUser);

        _passwordHasherMock.Setup(x => x.HashPassword(command.Password)).Returns("hashed_pass");
        _jwtTokenGeneratorMock.Setup(x => x.GenerateToken(It.IsAny<Domain.Entities.User>())).Returns("access_token");
        _jwtTokenGeneratorMock.Setup(x => x.GenerateRefreshToken())
            .Returns(("refresh_token", DateTime.UtcNow.AddDays(7)));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Token.Should().Be("access_token");

        _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Domain.Entities.User>(), It.IsAny<CancellationToken>()),
            Times.Never);

        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);

        existingGuestUser.Email.Should().Be(command.Email);
        existingGuestUser.FirstName.Should().Be(command.FirstName);
        existingGuestUser.LastName.Should().Be(command.LastName);
        existingGuestUser.PasswordHash.Should().Be("hashed_pass");
        existingGuestUser.Role.Should().Be(Domain.Enums.Role.Client);
    }
}
