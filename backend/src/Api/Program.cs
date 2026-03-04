using Api.Extensions;
using Application;
using Infrastructure;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.AddPresentation();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();


// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

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
app.MapServiceEndpoints();
app.MapAppointmentEndpoints();
app.MapCategoryEndpoints();
app.AddExceptionHandling();

app.Run();
