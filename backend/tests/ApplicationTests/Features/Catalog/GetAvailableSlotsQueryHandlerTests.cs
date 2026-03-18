using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Features.Catalog.GetAvailableSlots;
using CSharpFunctionalExtensions;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Catalog;

public class GetAvailableSlotsQueryHandlerTests
{
    private readonly Mock<ISlotService> _slotServiceMock;
    private readonly GetAvailableSlotsQueryHandler _handler;

    public GetAvailableSlotsQueryHandlerTests()
    {
        _slotServiceMock = new Mock<ISlotService>();
        _handler = new GetAvailableSlotsQueryHandler(_slotServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnSlots_WhenServiceReturnsSuccess()
    {
        // Arrange
        var query = new GetAvailableSlotsQuery(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.Date);

        var expectedSlots = new List<SlotResponse>();

        _slotServiceMock
            .Setup(x => x.GetAvailableSlotsAsync(
                query.MasterId,
                query.ServiceId,
                query.Date,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSlots);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeSameAs(expectedSlots);

        _slotServiceMock.Verify(x => x.GetAvailableSlotsAsync(
                query.MasterId,
                query.ServiceId,
                query.Date,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
