using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InfrastructureTests.Repos;

public abstract class BaseRepositoryTest : IDisposable
{
    protected readonly ApplicationDbContext context;

    protected BaseRepositoryTest()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        context = new ApplicationDbContext(options);

        context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        context.Database.EnsureDeleted();
        context.Dispose();
        GC.SuppressFinalize(this);
    }

    protected async Task<User> CreateUserAsync(string email = "test@test.com", string phone = "+380000000000")
    {
        var user = User.CreateRegistered("FirstName", "LastName", email, "password_hash", phone);
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    protected async Task<Master> CreateMasterAsync(User? user = null)
    {
        var randomPhone = $"+380{Random.Shared.Next(100000000, 999999999)}";

        var owner = user ?? await CreateUserAsync(Guid.NewGuid() + "@test.com", randomPhone);
        var master = new Master(owner.Id, "Expert bio");
        context.Masters.Add(master);
        await context.SaveChangesAsync();
        return master;
    }

    protected async Task<Category> CreateCategoryAsync(string title = "General SPA", string slug = "spa", bool isActive = true)
    {
        var category = new Category(title, slug);
        if (!isActive)
        {
            category.Deactivate();
        }

        context.Categories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }

    protected async Task<Service> CreateServiceAsync(Guid categoryId, string title = "Massage", int duration = 60)
    {
        var service = new Service(categoryId, "service", title, "Description", duration, 1000m);
        context.Services.Add(service);
        await context.SaveChangesAsync();
        return service;
    }

    protected async Task<Schedule> CreateScheduleAsync(Guid masterId, int dayOfWeek, TimeOnly start, TimeOnly end)
    {
        var schedule = new Schedule(masterId, dayOfWeek, start, end);
        context.Schedules.Add(schedule);
        await context.SaveChangesAsync();
        return schedule;
    }

    protected async Task<Appointment> CreateAppointmentAsync(
        Guid masterId,
        Service service,
        DateTime startTime,
        Guid? clientId = null,
        string? notes = "Test appointment")
    {
        if (!clientId.HasValue)
        {
            var randomPhone = $"+380{Random.Shared.Next(100000000, 999999999)}";
            var clientUser = await CreateUserAsync($"{Guid.NewGuid()}@client.com", randomPhone);
            clientId = clientUser.Id;
        }

        var appointment = new Appointment(
            clientId.Value,
            masterId,
            service,
            startTime,
            notes
        );

        context.Appointments.Add(appointment);
        await context.SaveChangesAsync();

        return appointment;
    }

    protected async Task<TimeOff> CreateTimeOffAsync(
        Guid masterId,
        DateOnly startDate,
        DateOnly? endDate = null,
        string? reason = "Vacation")
    {
        var actualEndDate = endDate ?? startDate;

        var timeOff = new TimeOff(masterId, startDate, actualEndDate, reason);

        context.TimeOffs.Add(timeOff);
        await context.SaveChangesAsync();

        return timeOff;
    }
}
