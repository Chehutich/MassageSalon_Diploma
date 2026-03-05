using Application.Features.Appointments.CancelAppointment;
using Application.Features.Appointments.CreateAppointment;
using Application.Features.Appointments.GetAppointmentDetails;
using Application.Features.Appointments.GetMyAppointments;
using Application.Features.Appointments.RescheduleAppointment;
using Application.Features.Catalog.GetAvailableSlots;
using MediatR;

namespace Api.Extensions.Endpoints;

public static class AppointmentEndpoints
{
    public static IEndpointRouteBuilder MapAppointmentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/appointments")
            .WithTags("Appointments")
            .RequireAuthorization();

        group.MapGet("/my", async (
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var query = new GetMyAppointmentsQuery();
                var result = await sender.Send(query, cancellationToken);

                return Results.Ok(result.Value);
            })
            .WithName("GetMyAppointments")
            .WithDescription("Retrieves all appointments for the current user.");

        group.MapGet("/{id:guid}", async (
                Guid id,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var query = new GetAppointmentDetailsQuery(id);
                var result = await sender.Send(query, cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .WithName("GetAppointmentDetails")
            .WithDescription("Retrieves full details for a specific appointment.");

        group.MapGet("/available-slots", async (
                Guid serviceId,
                DateTime date,
                Guid? masterId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var query = new GetAvailableSlotsQuery(masterId, serviceId, date);
                var result = await sender.Send(query, cancellationToken);

                return Results.Ok(result.Value);
            })
            .WithName("GetAvailableSlots")
            .WithDescription("Retrieves a list of available time slots for a specific master and service on a given date.");

        group.MapPost("", async (CreateAppointmentCommand command,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);

                var detailsQuery = new GetAppointmentDetailsQuery(result.Value);
                var detailsResult = await sender.Send(detailsQuery, cancellationToken);

                return Results.Created(
                    $"/api/appointments/{result.Value}",
                    detailsResult.Value
                );
            })
            .WithName("CreateAppointment")
            .WithDescription("Books a new appointment for a specific service and master.");

        group.MapPost("/{id:guid}/reschedule", async (
                Guid id,
                RescheduleAppointmentCommand command,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                if (id != command.AppointmentId)
                {
                    return Results.Problem(
                        statusCode: StatusCodes.Status400BadRequest,
                        title: "Bad Request",
                        detail: "The ID in the URL does not match the Appointment ID in the request body."
                    );
                }

                var result = await sender.Send(command, cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .WithName("RescheduleAppointment")
            .WithDescription("Reschedules an existing appointment to a new time. Must be done at least 24 hours in advance.");

        group.MapPost("/{id:guid}/cancel", async (
                Guid id,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var command = new CancelAppointmentCommand(id);
                var result = await sender.Send(command, cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .WithName("CancelAppointment")
            .WithDescription("Cancels an existing appointment. Must be done at least 1 hour in advance.");

        return app;
    }
}
