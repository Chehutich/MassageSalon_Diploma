using Api.Extensions;
using Api.Extensions.Endpoints;
using Application;
using Infrastructure;
using Infrastructure.Notifications;
using Microsoft.Extensions.FileProviders;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.AddPresentation();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

var app = builder.Build();

app.UseCors(policy => policy
    .WithOrigins("http://localhost:8081") // Expo
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()
);

app.UseSerilogRequestLogging();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("Massage Salon API")
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

var uploadsPath = app.Configuration["FileStorage:Path"]
    ?? Path.Combine(app.Environment.ContentRootPath, "AppData", "uploads");
Directory.CreateDirectory(uploadsPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

//app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthEndpoints();
app.MapAuthEndpoints();
app.MapUserEndpoints();
app.MapServiceEndpoints();
app.MapAppointmentEndpoints();
app.MapCategoryEndpoints();
app.MapMasterEndpoints();
app.MapMastersEndpoints();
app.AddExceptionHandling();

app.MapHub<NotificationHub>("/notifications-hub");

app.Run();
