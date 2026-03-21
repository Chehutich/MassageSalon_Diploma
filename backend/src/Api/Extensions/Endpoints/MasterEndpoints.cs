using Application.Common.Models;
using Application.Features.Master.GetMasterSchedule;
using Application.Features.Master.GetMasterWorkingHours;
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

                return Results.Ok(result.Value);
            })
            .Produces<List<AppointmentDetailsResponse>>()
            .WithName("Get My Schedule")
            .WithDescription("Retrieves the schedule for the current master.");

        personalGroup.MapGet("working-hours", async (
                int? month,
                int? year,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetMasterWorkingHoursQuery(month, year), cancellationToken);

                return Results.Ok(result.Value);
            })
            .Produces<List<MasterWorkingHoursResponse>>()
            .WithName("Get Master Working Hours")
            .WithDescription("Retrieves the working hours for a specific master.");

        return app;
    }
}
