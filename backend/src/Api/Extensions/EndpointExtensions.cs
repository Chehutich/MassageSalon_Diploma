using Application.Features.Commands.ChangeEmail;
using Application.Features.Commands.ChangePassword;
using Application.Features.Commands.ChangePhone;
using Application.Features.Commands.Login;
using Application.Features.Commands.Logout;
using Application.Features.Commands.RefreshToken;
using Application.Features.Commands.Register;
using Application.Features.Queries.GetCategories;
using Application.Features.Queries.GetMe;
using Application.Features.Queries.GetServiceById;
using Application.Features.Queries.GetServices;
using MediatR;

namespace Api.Extensions;

public static class EndpointExtensions
{
    #region Authorization

    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (RegisterCommand command, ISender sender) =>
            {
                var result = await sender.Send(command);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .WithName("RegisterUser");

        group.MapPost("/login", async (LoginCommand command, ISender sender, HttpContext context) =>
        {
            var result = await sender.Send(command);
            if (result.IsFailure)
            {
                return result.ToProblemDetails();
            }

            AppendAuthCookies(context, result.Value.Token, result.Value.RefreshToken);

            return Results.Ok(new { result.Value.Id, result.Value.FirstName, result.Value.Email });
        });

        group.MapPost("/refresh", async (ISender sender, HttpContext context) =>
        {
            var accessToken = context.Request.Cookies["accessToken"];
            var refreshToken = context.Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(refreshToken))
            {
                return Results.Unauthorized();
            }

            var result = await sender.Send(new RefreshTokenCommand(accessToken, refreshToken));

            if (result.IsFailure)
            {
                return result.ToProblemDetails();
            }

            AppendAuthCookies(context, result.Value.Token, result.Value.RefreshToken);

            return Results.Ok();
        }).AllowAnonymous();

        group.MapGet("/me", async (ISender sender) =>
            {
                var result = await sender.Send(new GetMeQuery());
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .WithName("GetMe")
            .RequireAuthorization();

        group.MapPut("/change-email", async (ChangeEmailCommand command, ISender sender) =>
            {
                var result = await sender.Send(command);
                return result.IsSuccess
                    ? Results.Ok()
                    : result.ToProblemDetails();
            })
            .WithName("ChangeEmail")
            .RequireAuthorization();

        group.MapPut("/change-password", async (ChangePasswordCommand command, ISender sender) =>
            {
                var result = await sender.Send(command);
                return result.IsSuccess
                    ? Results.Ok()
                    : result.ToProblemDetails();
            })
            .WithName("ChangePassword")
            .RequireAuthorization();

        group.MapPut("/change-phone", async (ChangePhoneCommand command, ISender sender) =>
            {
                var result = await sender.Send(command);
                return result.IsSuccess ?
                    Results.Ok()
                    : result.ToProblemDetails();
            })
            .WithName("ChangePhone")
            .RequireAuthorization();

        group.MapPost("/logout", async (HttpContext context, ISender sender) =>
            {
                await sender.Send(new LogoutCommand());

                var options = new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict };
                context.Response.Cookies.Delete("accessToken", options);
                context.Response.Cookies.Delete("refreshToken", options);

                return Results.Ok();
            })
            .WithName("Logout");



        return app;
    }

    #endregion

    #region Services

    public static IEndpointRouteBuilder MapServiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/services")
            .WithTags("Services")
            .RequireAuthorization();

        group.MapGet("/", async (ISender sender) =>
        {
            var result = await sender.Send(new GetServicesQuery());

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : result.ToProblemDetails();
        });

        group.MapGet("/{id:guid}", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new GetServiceByIdQuery(id));

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .WithName("GetServiceById");

        group.MapGet("/categories", async (ISender sender) =>
            {
                var result = await sender.Send(new GetCategoriesQuery());

                return Results.Ok(result.Value);
            })
            .WithName("GetCategories");

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
