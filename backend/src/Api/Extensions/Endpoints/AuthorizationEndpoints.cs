using Application.Common.Models;
using Application.Features.Auth.Login;
using Application.Features.Auth.RefreshToken;
using Application.Features.Auth.Register;
using Application.Features.User.GetMe;
using Application.Features.User.Logout;
using MediatR;

namespace Api.Extensions.Endpoints;

public static class AuthorizationEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .ProducesProblem(400)
            .WithTags("Auth");

        group.MapPost("/register",
                async (RegisterCommand command, ISender sender, CancellationToken cancellationToken) =>
                {
                    var result = await sender.Send(command, cancellationToken);
                    return result.IsSuccess
                        ? Results.Ok(result.Value)
                        : result.ToProblemDetails();
                })
            .Produces(StatusCodes.Status200OK)
            .ProducesProblem(409)
            .AllowAnonymous()
            .WithName("RegisterUser")
            .WithDescription("Registers a new user.");

        group.MapPost("/login",
                async (LoginCommand command,
                    ISender sender,
                    HttpContext context,
                    CancellationToken cancellationToken) =>
                {
                    var result = await sender.Send(command, cancellationToken);
                    if (result.IsFailure)
                    {
                        return result.ToProblemDetails();
                    }

                    AppendAuthCookies(context, result.Value.Token, result.Value.RefreshToken);

                    return Results.Ok(new AuthResponse(result.Value.Id, result.Value.FirstName, result.Value.Email,
                        result.Value.Token, result.Value.RefreshToken));
                })
            .Produces<AuthResponse>()
            .ProducesProblem(401)
            .AllowAnonymous()
            .WithName("LoginUser")
            .WithDescription("Authenticates a user and issues JWT tokens via HTTP-only cookies.");

        group.MapPost("/refresh", async (ISender sender, HttpContext context, CancellationToken cancellationToken) =>
            {
                var accessToken = context.Request.Cookies["accessToken"] ?? string.Empty;
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
            .Produces(StatusCodes.Status200OK)
            .ProducesProblem(401)
            .AllowAnonymous()
            .WithName("RefreshToken")
            .WithDescription("Refreshes the authentication tokens using the refresh token from cookies.");

        group.MapPost("/refresh-mobile",
            async (RefreshTokenCommand command, ISender sender, CancellationToken cancellationToken) =>
            {
                if (string.IsNullOrEmpty(command.RefreshToken))
                {
                    return Results.Unauthorized();
                }

                var result = await sender.Send(new RefreshTokenCommand(command.AccessToken, command.RefreshToken), cancellationToken);

                if (result.IsFailure)
                {
                    return result.ToProblemDetails();
                }

                return Results.Ok(result.Value);
            })
            .Produces<AuthResponse>()
            .ProducesProblem(401)
            .AllowAnonymous()
            .WithName("RefreshTokenForMobile")
            .WithDescription("Refreshes the authentication tokens using the refresh token from body.");

        return app;
    }

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
}
