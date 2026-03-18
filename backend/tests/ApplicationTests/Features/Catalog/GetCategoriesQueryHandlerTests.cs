using Application.Common.Interfaces.Repos;
using Application.Features.Catalog.GetCategories;
using Domain.Entities;
using FluentAssertions;
using Moq;

namespace ApplicationTests.Features.Catalog;

public class GetCategoriesQueryHandlerTests
{
    private readonly Mock<ICategoryRepository> _categoryRepositoryMock;
    private readonly GetCategoriesQueryHandler _handler;

    public GetCategoriesQueryHandlerTests()
    {
        _categoryRepositoryMock = new Mock<ICategoryRepository>();
        _handler = new GetCategoriesQueryHandler(_categoryRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnMappedCategories_WhenCategoriesExist()
    {
        // Arrange
        var categories = new List<Category>
        {
            new Category("Massage", "Massage-"), new Category("Spa Procedures", "sPA")
        };

        _categoryRepositoryMock
            .Setup(x => x.GetAllActiveAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(categories);

        var query = new GetCategoriesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
        result.Value.Should().Contain(c => c.Slug == "massage");
        result.Value.Should().Contain(c => c.Slug == "spa");
    }

    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenNoCategoriesFound()
    {
        // Arrange
        _categoryRepositoryMock
            .Setup(x => x.GetAllActiveAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Category>());

        var query = new GetCategoriesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }
}
