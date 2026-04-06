using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace Api.Extensions.Endpoints;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/health")
            .WithTags("Health");

        group.MapHealthChecks("/", new HealthCheckOptions
        {
            ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
        });

        group.MapGet("/ping", () => Results.Ok(new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow
            }))
            .WithName("Ping");

        return app;
    }
}
