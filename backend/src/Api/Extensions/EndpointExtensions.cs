using Application.Features.Commands.ChangeEmail;
using Application.Features.Commands.ChangePassword;
using Application.Features.Commands.ChangePhone;
using Application.Features.Commands.CreateAppointment;
using Application.Features.Commands.Login;
using Application.Features.Commands.Logout;
using Application.Features.Commands.RefreshToken;
using Application.Features.Commands.Register;
using Application.Features.Queries.GetAvailableSlots;
using Application.Features.Queries.GetCategories;
using Application.Features.Queries.GetMe;
using Application.Features.Queries.GetServiceById;
using Application.Features.Queries.GetServices;
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
                var accessToken = context.Request.Cookies["accessToken"];
                var refreshToken = context.Request.Cookies["refreshToken"];

                if (string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(refreshToken))
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

        group.MapGet("/categories", async (ISender sender, CancellationToken cancellationToken) =>
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

        group.MapPost("", async ([FromBody] CreateAppointmentCommand command,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .WithName("CreateAppointment")
            .WithDescription("Books a new appointment for a specific service and master.");

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
