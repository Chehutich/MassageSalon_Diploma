using Application.Common.Models;
using Application.Features.Catalog.GetServiceById;
using Application.Features.Catalog.GetServices;
using MediatR;

namespace Api.Extensions.Endpoints;

public static class ServiceEndpoints
{
    public static IEndpointRouteBuilder MapServiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/services")
            .WithTags("Services")
            .ProducesProblem(401)
            .RequireAuthorization();

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetServicesQuery(), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .Produces<List<ServiceResponse>>()
            .WithName("GetServices")
            .WithDescription("Retrieves a list of all available services.");

        group.MapGet("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetServiceByIdQuery(id), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .Produces<ServiceDetailsResponse>()
            .ProducesProblem(404)
            .WithName("GetServiceById")
            .WithDescription("Retrieves detailed information about a specific service by its unique ID.");

        return app;
    }
}
