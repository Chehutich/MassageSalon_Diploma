using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Infrastructure.Authentication;
using Infrastructure.Notifications;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Repos;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Infrastructure;

public static class InfrastructureInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("No connection string configured");
        }

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        });

        services.AddHealthChecks()
                    .AddNpgSql(
                        connectionString,
                        name: "PostgreSQL",
                        failureStatus: HealthStatus.Unhealthy,
                        tags: ["db", "sql", "ready"]);

        services.AddSignalR();

        services.AddHttpContextAccessor();

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();
        services.AddScoped<ITimeOffRepository, TimeOffRepository>();

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IServiceRepository, ServiceRepository>();
        services.AddScoped<ICurrentUserContext, CurrentUserContext>();
        services.AddScoped<IMasterRepository, MasterRepository>();
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IFileStorageService, FileStorageService>();

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

        services.AddScoped<INotificationService, SignalRNotificationService>();

        return services;
    }
}
