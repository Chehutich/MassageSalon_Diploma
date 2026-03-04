using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using MediatR;

namespace Application.Features.Catalog.GetCategories;

public record GetCategoriesQuery() : IRequest<Result<List<CategoryResponse>>>;

public class GetCategoriesQueryHandler(
    ICategoryRepository categoryRepository
    ) : IRequestHandler<GetCategoriesQuery, Result<List<CategoryResponse>>>
{
    public async Task<Result<List<CategoryResponse>>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await categoryRepository.GetAllActiveAsync(cancellationToken);

        return categories.Select(c => new CategoryResponse(c.Id, c.Title))
            .ToList();
    }
}
