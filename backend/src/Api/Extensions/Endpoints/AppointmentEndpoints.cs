using Application.Common.Models;
using Application.Features.Appointments.CancelAppointment;
using Application.Features.Appointments.CreateAppointment;
using Application.Features.Appointments.GetAppointmentDetails;
using Application.Features.Appointments.GetMyAppointments;
using Application.Features.Appointments.RescheduleAppointment;
using Application.Features.Catalog.GetAvailableDates;
using Application.Features.Catalog.GetAvailableSlots;
using MediatR;

namespace Api.Extensions.Endpoints;

public static class AppointmentEndpoints
{
    public static IEndpointRouteBuilder MapAppointmentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/appointments")
            .WithTags("Appointments")
            .ProducesProblem(401)
            .ProducesProblem(400)
            .RequireAuthorization();

        group.MapGet("/my", async (
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var query = new GetMyAppointmentsQuery();
                var result = await sender.Send(query, cancellationToken);

                return Results.Ok(result.Value);
            })
            .Produces<List<MyAppointmentResponse>>()
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
            .Produces<AppointmentDetailsResponse>()
            .ProducesProblem(404)
            .WithName("GetAppointmentDetails")
            .WithDescription("Retrieves full details for a specific appointment.");

        group.MapGet("/available-slots", async (
                [AsParameters] GetAvailableSlotsQuery query,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(query, cancellationToken);

                return Results.Ok(result.Value);
            })
            .Produces<List<SlotResponse>>()
            .WithName("GetAvailableSlots")
            .WithDescription("Retrieves a list of available time slots for a specific master and service on a given date.");

        group.MapGet("/available-dates", async (
                [AsParameters] GetAvailableDatesQuery query,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(query, cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .Produces<List<DateOnly>>()
            .WithName("GetAvailableDates")
            .WithDescription("Retrieves a list of dates that have at least one free slot for a specific service (and master).");

        group.MapPost("", async (CreateAppointmentCommand command,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);

                if (result.IsFailure)
                {
                    return result.ToProblemDetails();
                }

                var detailsQuery = new GetAppointmentDetailsQuery(result.Value);
                var detailsResult = await sender.Send(detailsQuery, cancellationToken);

                return Results.Created(
                    $"/api/appointments/{result.Value}",
                    detailsResult.Value
                );
            })
            .Produces<AppointmentDetailsResponse>()
            .ProducesProblem(404)
            .ProducesProblem(409)
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

                if (result.IsFailure)
                {
                    return result.ToProblemDetails();
                }

                var details = await sender.Send(
                    new GetAppointmentDetailsQuery(result.Value), cancellationToken);

                return details.IsSuccess
                    ? Results.Ok(details.Value)
                    : details.ToProblemDetails();
            })
            .Produces<AppointmentDetailsResponse>()
            .ProducesProblem(404)
            .ProducesProblem(409)
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
                    ? Results.NoContent()
                    : result.ToProblemDetails();
            })
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(404)
            .WithName("CancelAppointment")
            .WithDescription("Cancels an existing appointment. Must be done at least 1 hour in advance.");

        return app;
    }
}
