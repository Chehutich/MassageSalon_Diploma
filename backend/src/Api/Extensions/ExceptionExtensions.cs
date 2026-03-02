namespace Api.Extensions;

public static class ExceptionExtensions
{
    public static IApplicationBuilder AddExceptionHandling(this IApplicationBuilder app)
    {
        app.UseExceptionHandler(exceptionHandlerApp =>
        {
            exceptionHandlerApp.Run(async context =>
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/problem+json";

                await context.Response.WriteAsJsonAsync(new
                {
                    Title = "An unexpected error occurred",
                    Status = 500,
                    Detail = "Internal server error. Please try again later.",
                });
            });
        });

        return app;
    }
}
