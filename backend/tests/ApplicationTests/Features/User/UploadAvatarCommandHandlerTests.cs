using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Features.User.UploadAvatar;
using Domain.Errors;
using FluentAssertions;
using Moq;
using Xunit;

namespace ApplicationTests.Features.User;

public class UploadAvatarCommandHandlerTests
{
    private readonly Mock<ICurrentUserContext> _currentUserContextMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IFileStorageService> _fileStorageServiceMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly UploadAvatarCommandHandler _handler;

    public UploadAvatarCommandHandlerTests()
    {
        _currentUserContextMock = new Mock<ICurrentUserContext>();
        _userRepositoryMock = new Mock<IUserRepository>();
        _fileStorageServiceMock = new Mock<IFileStorageService>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new UploadAvatarCommandHandler(
            _currentUserContextMock.Object,
            _userRepositoryMock.Object,
            _fileStorageServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnEmptyFileError_WhenStreamIsNull()
    {
        // Arrange
        var command = new UploadAvatarCommand(null!, "test.png");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.File.EmptyFile);

        _fileStorageServiceMock.Verify(
            x => x.UploadAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldReturnEmptyFileError_WhenStreamIsEmpty()
    {
        // Arrange
        using var emptyStream = new MemoryStream();
        var command = new UploadAvatarCommand(emptyStream, "test.png");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.File.EmptyFile);
    }

    [Fact]
    public async Task Handle_ShouldReturnUserNotFoundError_WhenUserDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("fake data"));
        var command = new UploadAvatarCommand(stream, "test.png");

        _currentUserContextMock.Setup(x => x.Id).Returns(userId);
        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.User)null!);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Errors.User.NotFound(userId));
    }

    [Fact]
    public async Task Handle_ShouldUploadFileAndSaveUser_WhenUserHasNoOldPhoto()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var fileName = "avatar.jpg";
        var fileUrl = "https://cdn.com/uploads/unique-avatar.jpg";
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("fake image data"));

        var user = Domain.Entities.User.CreateRegistered("test", "test", "test@gmail.com", "hash", "+380");

        var command = new UploadAvatarCommand(stream, fileName);

        _currentUserContextMock.Setup(x => x.Id).Returns(userId);
        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _fileStorageServiceMock
            .Setup(x => x.UploadAsync(stream, fileName, It.IsAny<CancellationToken>()))
            .ReturnsAsync(fileUrl);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(fileUrl);

        _fileStorageServiceMock.Verify(
            x => x.DeleteAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);

        _unitOfWorkMock.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldDeleteOldPhotoAndUploadNew_WhenUserHasOldPhoto()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var fileName = "new-avatar.jpg";
        var oldFileUrl = "https://cdn.com/uploads/OLD-avatar.jpg";
        var newFileUrl = "https://cdn.com/uploads/NEW-avatar.jpg";
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("fake image data"));

        var user = Domain.Entities.User.CreateRegistered("test", "test", "test@gmail.com", "hash", "+380");
        user.SetPhotoUrl(oldFileUrl);

        var command = new UploadAvatarCommand(stream, fileName);

        _currentUserContextMock.Setup(x => x.Id).Returns(userId);
        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _fileStorageServiceMock
            .Setup(x => x.UploadAsync(stream, fileName, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newFileUrl);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        _fileStorageServiceMock.Verify(
            x => x.DeleteAsync(oldFileUrl, It.IsAny<CancellationToken>()),
            Times.Once);

        _fileStorageServiceMock.Verify(
            x => x.UploadAsync(stream, fileName, It.IsAny<CancellationToken>()),
            Times.Once);

        _unitOfWorkMock.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
