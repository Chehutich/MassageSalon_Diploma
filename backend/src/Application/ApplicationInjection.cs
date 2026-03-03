using Application.Common.Behaviors;
using Application.Common.Interfaces;
using Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class ApplicationInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(typeof(ApplicationInjection).Assembly);

            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssembly(typeof(ApplicationInjection).Assembly);
        services.AddScoped<ISlotService, SlotService>();
        services.AddSingleton(TimeProvider.System);

        return services;
    }
}
