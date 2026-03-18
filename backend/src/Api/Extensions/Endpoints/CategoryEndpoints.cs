using Application.Common.Models;
using Application.Features.Catalog.GetCategories;
using MediatR;

namespace Api.Extensions.Endpoints;

public static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/categories")
            .WithTags("Categories")
            .ProducesProblem(401)
            .RequireAuthorization();

        group.MapGet("", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetCategoriesQuery(), cancellationToken);

                return Results.Ok(result.Value);
            })
            .Produces<List<CategoryResponse>>()
            .WithName("GetCategories")
            .WithDescription("Retrieves a list of all service categories.");

        return app;
    }
}
