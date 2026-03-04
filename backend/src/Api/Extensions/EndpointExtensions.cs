using Application.Features.Appointments.CancelAppointment;
using Application.Features.Appointments.CreateAppointment;
using Application.Features.Appointments.RescheduleAppointment;
using Application.Features.Auth.Login;
using Application.Features.Auth.RefreshToken;
using Application.Features.Auth.Register;
using Application.Features.Catalog.GetAvailableSlots;
using Application.Features.Catalog.GetCategories;
using Application.Features.Catalog.GetServiceById;
using Application.Features.Catalog.GetServices;
using Application.Features.User.ChangeEmail;
using Application.Features.User.ChangePassword;
using Application.Features.User.ChangePhone;
using Application.Features.User.GetMe;
using Application.Features.User.Logout;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Api.Extensions;

public static class EndpointExtensions
{
    #region Authorization

    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Auth");

        group.MapPost("/register", async (RegisterCommand command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .WithName("RegisterUser")
            .WithDescription("Registers a new user.");

        group.MapPost("/login", async (LoginCommand command, ISender sender, HttpContext context, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                if (result.IsFailure)
                {
                    return result.ToProblemDetails();
                }

                AppendAuthCookies(context, result.Value.Token, result.Value.RefreshToken);

                return Results.Ok(new { result.Value.Id, result.Value.FirstName, result.Value.Email });
            })
            .WithName("LoginUser")
            .WithDescription("Authenticates a user and issues JWT tokens via HTTP-only cookies.");

        group.MapPost("/refresh", async (ISender sender, HttpContext context, CancellationToken cancellationToken) =>
            {
                var accessToken = context.Request.Cookies["accessToken"] ?? string.Empty;;
                var refreshToken = context.Request.Cookies["refreshToken"];

                if (string.IsNullOrEmpty(refreshToken))
                {
                    return Results.Unauthorized();
                }

                var result = await sender.Send(new RefreshTokenCommand(accessToken, refreshToken), cancellationToken);

                if (result.IsFailure)
                {
                    return result.ToProblemDetails();
                }

                AppendAuthCookies(context, result.Value.Token, result.Value.RefreshToken);

                return Results.Ok();
            })
            .AllowAnonymous()
            .WithName("RefreshToken")
            .WithDescription("Refreshes the authentication tokens using the refresh token from cookies.");

        group.MapGet("/me", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetMeQuery(), cancellationToken);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .WithName("GetMe")
            .WithDescription("Retrieves the profile information of the currently authenticated user.")
            .RequireAuthorization();

        group.MapPut("/change-email", async (ChangeEmailCommand command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.IsSuccess
                    ? Results.Ok()
                    : result.ToProblemDetails();
            })
            .WithName("ChangeEmail")
            .WithDescription("Updates the email address of the currently authenticated user.")
            .RequireAuthorization();

        group.MapPut("/change-password", async (ChangePasswordCommand command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.IsSuccess
                    ? Results.Ok()
                    : result.ToProblemDetails();
            })
            .WithName("ChangePassword")
            .WithDescription("Updates the password of the currently authenticated user.")
            .RequireAuthorization();

        group.MapPut("/change-phone", async (ChangePhoneCommand command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.IsSuccess
                    ? Results.Ok()
                    : result.ToProblemDetails();
            })
            .WithName("ChangePhone")
            .WithDescription("Updates the phone number of the currently authenticated user.")
            .RequireAuthorization();

        group.MapPost("/logout", async (HttpContext context, ISender sender, CancellationToken cancellationToken) =>
            {
                await sender.Send(new LogoutCommand(), cancellationToken);

                var options = new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict };
                context.Response.Cookies.Delete("accessToken", options);
                context.Response.Cookies.Delete("refreshToken", options);

                return Results.Ok();
            })
            .WithName("Logout")
            .WithDescription("Logs out the current user and clears authentication cookies.");

        return app;
    }

    #endregion

    #region Services

    public static IEndpointRouteBuilder MapServiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/services")
            .WithTags("Services")
            .RequireAuthorization();

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetServicesQuery(), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .WithName("GetServices")
            .WithDescription("Retrieves a list of all available services.");

        group.MapGet("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetServiceByIdQuery(id), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .WithName("GetServiceById")
            .WithDescription("Retrieves detailed information about a specific service by its unique ID.");

        return app;
    }

    #endregion

    #region Categories

    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/categories")
            .WithTags("Categories")
            .RequireAuthorization();

        group.MapGet("", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetCategoriesQuery(), cancellationToken);

                return Results.Ok(result.Value);
            })
            .WithName("GetCategories")
            .WithDescription("Retrieves a list of all service categories.");

        return app;
    }

    #endregion

    #region Appointments

    public static IEndpointRouteBuilder MapAppointmentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/appointments")
            .WithTags("Appointments")
            .RequireAuthorization();

        group.MapGet("/available-slots", async (Guid masterId,
                Guid serviceId,
                DateTime date,
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

                return result.IsSuccess
                    ? Results.Created($"/api/appointments/{result.Value}", new { id = result.Value })
                    : result.ToProblemDetails();
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

    #endregion

    #region Helpers

    private static void AppendAuthCookies(HttpContext context, string token, string refreshToken)
    {
        var baseOptions = new CookieOptions
        {
            HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict, Expires = DateTime.UtcNow.AddDays(7)
        };

        context.Response.Cookies.Append("accessToken", token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(15)
            });

        context.Response.Cookies.Append("refreshToken", refreshToken, baseOptions);
    }

    #endregion
}
