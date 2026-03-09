using Api.Extensions;
using Api.Extensions.Endpoints;
using Application;
using Infrastructure;
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

//app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapUserEndpoints();
app.MapServiceEndpoints();
app.MapAppointmentEndpoints();
app.MapCategoryEndpoints();
app.MapMasterEndpoints();
app.AddExceptionHandling();

app.Run("http://0.0.0.0:5260");
