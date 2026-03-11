using Application.Common.Models;
using Application.Features.Master.GetMasterSchedule;
using MediatR;

namespace Api.Extensions.Endpoints;

public static class MasterEndpoints
{
    public static IEndpointRouteBuilder MapMasterEndpoints(this IEndpointRouteBuilder app)
    {
        var personalGroup = app.MapGroup("/api/master")
            .WithTags("Master (Personal Cabinet)")
            .ProducesProblem(401)
            .RequireAuthorization(policy => policy.RequireRole("Master"));

        personalGroup.MapGet("schedule", async (
                DateTime? from,
                DateTime? to,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetMasterScheduleQuery(from, to), cancellationToken);

                return  Results.Ok(result.Value);
            })
            .Produces<List<AppointmentDetailsResponse>>()
            .WithName("Get My Schedule")
            .WithDescription("Retrieves the schedule for the current master.");

        return app;
    }
}
