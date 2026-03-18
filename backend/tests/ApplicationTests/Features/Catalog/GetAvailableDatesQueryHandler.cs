using Application.Common.Interfaces;
using Application.Features.Catalog.GetAvailableDates;
using CSharpFunctionalExtensions;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Catalog;

public class GetAvailableDatesQueryHandlerTests
{
    private readonly Mock<ISlotService> _slotServiceMock;
    private readonly GetAvailableDatesQueryHandler _handler;

    public GetAvailableDatesQueryHandlerTests()
    {
        _slotServiceMock = new Mock<ISlotService>();
        _handler = new GetAvailableDatesQueryHandler(_slotServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnDates_WhenServiceReturnsSuccess()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        var masterId = Guid.NewGuid();
        var year = 2026;
        var month = 8;

        var query = new GetAvailableDatesQuery(serviceId, masterId, year, month);

        var expectedDates = new List<DateOnly> { new(2026, 8, 6), new(2026, 8, 7) };

        _slotServiceMock
            .Setup(x => x.GetAvailableDatesAsync(
                query.ServiceId,
                query.MasterId,
                query.Year,
                query.Month,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedDates);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
        result.Value.Should().BeEquivalentTo(expectedDates);

        _slotServiceMock.Verify(x => x.GetAvailableDatesAsync(
                query.ServiceId,
                query.MasterId,
                query.Year,
                query.Month,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldReturnEmptyList_WhenNoDatesAvailable()
    {
        // Arrange
        var query = new GetAvailableDatesQuery(Guid.NewGuid(), null, 2026, 12);

        _slotServiceMock
            .Setup(x => x.GetAvailableDatesAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid?>(),
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DateOnly>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }
}
