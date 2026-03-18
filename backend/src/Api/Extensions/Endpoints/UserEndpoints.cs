using Application.Common.Models;
using Application.Features.User.DeleteAvatarCommand;
using Application.Features.User.GetMe;
using Application.Features.User.Logout;
using Application.Features.User.UpdateProfile;
using Application.Features.User.UploadAvatar;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Api.Extensions.Endpoints;

public static class UserEndpoints
{
    public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/user")
            .ProducesProblem(400)
            .ProducesProblem(401)
            .RequireAuthorization()
            .WithTags("User");

        group.MapGet("/me", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetMeQuery(), cancellationToken);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblemDetails();
            })
            .Produces<UserMeResponse>()
            .ProducesProblem(404)
            .WithName("GetMe")
            .WithDescription("Retrieves the profile information of the currently authenticated user.");

        group.MapPost("/upload-avatar", async (
                IFormFile fileStream,
                ISender sender) =>
            {
                var command = new UploadAvatarCommand(fileStream.OpenReadStream(), fileStream.FileName);

                var result = await sender.Send(command);

                return result.IsSuccess
                    ? Results.Ok(new { url = result.Value })
                    : result.ToProblemDetails();
            })
            .DisableAntiforgery()
            .RequireAuthorization()
            .WithName("UploadAvatar")
            .WithDescription(
                "Uploads an avatar image for the currently authenticated user and sets it as the profile picture.");

        group.MapDelete("/avatar", async (ISender sender) =>
            {
                var result = await sender.Send(new DeleteAvatarCommand());

                return result.IsSuccess
                    ? Results.Ok()
                    : result.ToProblemDetails();
            })
            .RequireAuthorization()
            .WithName("DeleteAvatar")
            .WithDescription("Deletes the current user's avatar.");

        group.MapPatch("/me", async (UpdateProfileCommand command, ISender sender) =>
            {
                var result = await sender.Send(command);

                return result.IsSuccess
                    ? Results.Ok()
                    : result.ToProblemDetails();
            })
            .RequireAuthorization()
            .WithName("UpdateProfile")
            .WithDescription("Updates the profile information of the currently authenticated user.");

        group.MapPost("/logout", async (HttpContext context, ISender sender, CancellationToken cancellationToken) =>
            {
                await sender.Send(new LogoutCommand(), cancellationToken);

                var options = new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict };
                context.Response.Cookies.Delete("accessToken", options);
                context.Response.Cookies.Delete("refreshToken", options);

                return Results.Ok();
            })
            .Produces(StatusCodes.Status200OK)
            .WithName("Logout")
            .WithDescription("Logs out the current user and clears authentication cookies.");

        return app;
    }
}
