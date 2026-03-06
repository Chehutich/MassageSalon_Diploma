using Application.Common.Models;
using Application.Features.Masters.GetMasterDetails;
using Application.Features.Masters.GetMasters;
using MediatR;

namespace Api.Extensions.Endpoints;

public static class MastersEndpoints
{
    public static IEndpointRouteBuilder MapMasterEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters")
            .WithTags("Masters")
            .ProducesProblem(401)
            .RequireAuthorization();

        group.MapGet("", async (
                [AsParameters] GetMastersQuery query,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(query, cancellationToken);

                return Results.Ok(result.Value);
            })
            .Produces<List<MasterResponse>>()
            .WithName("Get Masters")
            .WithDescription("Retrieves a list of masters.");

        group.MapGet("{id:guid}", async (
                Guid id,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var query = new GetMasterDetailsQuery(id);
                var result = await sender.Send(query, cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .Produces<MasterDetailsResponse>()
            .ProducesProblem(404)
            .WithName("Get Master Details")
            .WithDescription("Retrieves detailed information about a specific master by its unique ID.");

        return app;
    }
}
