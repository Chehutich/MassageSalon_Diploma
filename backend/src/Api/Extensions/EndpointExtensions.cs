using Application.Features.Commands.LogoutCommand;
using Application.Features.Commands.RefreshTokenCommand;
using Application.Features.Commands.RegisterCommand;
using Application.Features.Queries.GetMe;
using Application.Features.Queries.GetService;
using Application.Features.Queries.Login;
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

        group.MapPost("/login", async (LoginQuery query, ISender sender, HttpContext context) =>
        {
            var result = await sender.Send(query);
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

        group.MapPost("/logout", async (HttpContext context, ISender sender) =>
            {
                await sender.Send(new LogoutCommand());

                var options = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict
                };
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
