using Application.Features.Auth.Login;
using Application.Features.Auth.RefreshToken;
using Application.Features.Auth.Register;
using Application.Features.User.ChangeEmail;
using Application.Features.User.ChangePassword;
using Application.Features.User.ChangePhone;
using Application.Features.User.GetMe;
using Application.Features.User.Logout;
using MediatR;

namespace Api.Extensions.Endpoints;

public static class AuthorizationEndpoints
{
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
