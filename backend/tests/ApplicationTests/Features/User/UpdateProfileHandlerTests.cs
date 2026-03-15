using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.User.UpdateProfile;
using Domain.Entities;
using Domain.Errors;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.User;

public class UpdateProfileHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<ICurrentUserContext> _userContextMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly UpdateProfileCommandHandler _handler;

    public UpdateProfileHandlerTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _userContextMock = new Mock<ICurrentUserContext>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new UpdateProfileCommandHandler(
            _userContextMock.Object,
            _userRepoMock.Object,
            _passwordHasherMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_UpdateBasicInfo_WhenRequestIsValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = Domain.Entities.User.CreateRegistered("Old", "Name", "test@test.com", "hash", "+380111");

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var command = new UpdateProfileCommand("New", "Last", null, null, null, null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        user.FirstName.Should().Be("New");
        user.LastName.Should().Be("Last");
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnError_WhenCurrentPasswordIsInvalid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = Domain.Entities.User.CreateRegistered("Name", "Name", "test@test.com", "correct_hash", "+380111");

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _passwordHasherMock.Setup(x => x.VerifyPassword("wrong_pass", "correct_hash"))
            .Returns(false);

        var command = new UpdateProfileCommand(null, null, "new@email.com", null, "wrong_pass", null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.User.InvalidPassword);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnError_WhenEmailAlreadyExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = Domain.Entities.User.CreateRegistered("Name", "Name", "old@test.com", "hash", "+380111");
        var existingUser =  Domain.Entities.User.CreateRegistered("Other", "User", "new@test.com", "hash", "+380222");

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _passwordHasherMock.Setup(x => x.VerifyPassword(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(true);

        _userRepoMock.Setup(x => x.GetByEmailAsync("new@test.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        var command = new UpdateProfileCommand(null, null, "new@test.com", null, "pass", null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.DuplicateEmail");
    }

    [Fact]
    public async Task Handle_Should_HashNewPassword_WhenPasswordIsChanged()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = Domain.Entities.User.CreateRegistered("Name", "Name", "test@test.com", "old_hash", "+380111");

        _userContextMock.Setup(x => x.Id).Returns(userId);
        _userRepoMock.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _passwordHasherMock.Setup(x => x.VerifyPassword("current_pass", "old_hash")).Returns(true);
        _passwordHasherMock.Setup(x => x.HashPassword("new_pass")).Returns("new_hash");

        var command = new UpdateProfileCommand(null, null, null, null, "current_pass", "new_pass");

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        user.PasswordHash.Should().Be("new_hash");
    }
}
