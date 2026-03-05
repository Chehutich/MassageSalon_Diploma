using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Api.Converters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Serilog;

namespace Api.Extensions;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddPresentation(this WebApplicationBuilder builder)
    {
        builder.Host.UseSerilog((context, configuration) =>
            configuration.ReadFrom.Configuration(context.Configuration));

        builder.Services.Configure<JsonOptions>(options =>
        {
            options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
            options.SerializerOptions.Converters.Add(new DateTimeUtcConverter());
        });

        var jwtSection = builder.Configuration.GetSection("Jwt");

        var jwtKey = jwtSection["Key"]
                     ?? throw new InvalidOperationException("JWT Key is missing in appsettings.json (Jwt:Key)");

        var jwtIssuer = jwtSection["Issuer"]
                        ?? throw new InvalidOperationException(
                            "JWT Issuer is missing in appsettings.json (Jwt:Issuer)");

        var jwtAudience = jwtSection["Audience"]
                          ?? throw new InvalidOperationException(
                              "JWT Audience is missing in appsettings.json (Jwt:Audience)");

        if (jwtKey.Length < 32)
        {
            throw new InvalidOperationException("JWT Key must be at least 32 characters long for security reasons.");
        }

        builder.Services.AddCors();

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.Request.Cookies.TryGetValue("accessToken", out var token))
                        {
                            context.Token = token;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

        builder.Services.AddAuthorization();

        builder.Services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Components ??= new OpenApiComponents();
                document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

                document.Components.SecuritySchemes.Add("jwt", new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Name = "Bearer",
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter only JWT token",
                });

                document.Security = [
                    new OpenApiSecurityRequirement
                    {
                        [new OpenApiSecuritySchemeReference("jwt")] = [],
                    },
                ];

                return Task.CompletedTask;
            });
        });

        return builder;
    }
}
