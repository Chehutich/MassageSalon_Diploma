using System.Text;
using Application.Common.Interfaces;
using Application.Features.User.UploadAvatar;
using Domain.Errors;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.User;

public class UploadAvatarCommandHandlerTests
{
    private readonly Mock<IFileStorageService> _fileStorageServiceMock;
    private readonly UploadAvatarCommandHandler _handler;

    public UploadAvatarCommandHandlerTests()
    {
        _fileStorageServiceMock = new Mock<IFileStorageService>();
        _handler = new UploadAvatarCommandHandler(_fileStorageServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFileUrl_WhenFileIsValid()
    {
        // Arrange
        var fileName = "avatar.jpg";
        var fileUrl = "https://cdn.com/uploads/unique-avatar.jpg";
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("fake image data"));

        var command = new UploadAvatarCommand(stream, fileName);

        _fileStorageServiceMock
            .Setup(x => x.UploadAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(fileUrl);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(fileUrl);

        _fileStorageServiceMock.Verify(
            x => x.UploadAsync(stream, fileName, It.IsAny<CancellationToken>()),
            Times.Once);
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
}
