using Domain.Entities;
using Domain.Enums;
using FluentAssertions;
using Infrastructure.Persistence.Repos;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace InfrastructureTests.Repos;

public class AppointmentRepositoryTests : BaseRepositoryTest
{
    private readonly AppointmentRepository _sut;

    public AppointmentRepositoryTests()
    {
        _sut = new AppointmentRepository(context);
    }

    [Fact]
    public async Task GetByIdWithDetailsAsync_ShouldReturnCompleteHierarchy()
    {
        // Arrange
        var masterUser = await CreateUserAsync("master@salon.com", "+380991112233", "John", "Master");
        var master = await CreateMasterAsync(masterUser);
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id);

        var clientUser = await CreateUserAsync("client@gmail.com", "+380994445566", "Alice", "Client");
        var appointment = await CreateAppointmentAsync(master.Id, service, DateTime.UtcNow.AddDays(1), clientUser.Id);

        // Act
        var result = await _sut.GetByIdWithDetailsAsync(appointment.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Service.Should().NotBeNull();
        result.Client.Should().NotBeNull();
        result.Master.User.Should().NotBeNull();
        result.Master.User.FirstName.Should().Be("John");
        result.Client.FirstName.Should().Be("Alice");
    }

    [Fact]
    public async Task GetByUserId_ShouldReturnAppointments_OrderedByDateDescending()
    {
        // Arrange
        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id);
        var client = await CreateUserAsync();

        var date1 = DateTime.UtcNow.AddDays(1);
        var date2 = DateTime.UtcNow.AddDays(2);

        await CreateAppointmentAsync(master.Id, service, date1, client.Id);
        await CreateAppointmentAsync(master.Id, service, date2, client.Id);

        // Act
        var result = await _sut.GetByUserId(client.Id);

        // Assert
        result.Should().HaveCount(2);
        result[0].StartTime.Should().BeAfter(result[1].StartTime); // Verification of OrderByDescending
    }

    [Fact]
    public async Task GetByMasterAndDateAsync_ShouldOnlyReturnAppointmentsForSpecificDay()
    {
        // Arrange
        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id);

        var targetDate = new DateTime(2026, 05, 20, 10, 0, 0, DateTimeKind.Utc);
        var differentDate = targetDate.AddDays(1);

        await CreateAppointmentAsync(master.Id, service, targetDate);
        await CreateAppointmentAsync(master.Id, service, differentDate);

        // Act
        var result = await _sut.GetByMasterAndDateAsync(master.Id, targetDate);

        // Assert
        result.Should().ContainSingle();
        result[0].StartTime.Date.Should().Be(targetDate.Date);
    }

    [Fact]
    public async Task GetByMasterAndPeriodAsync_ShouldDetectOverlapsCorrectly()
    {
        // Arrange
        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Massage", 60);

        var apptStart = new DateTime(2026, 06, 10, 14, 0, 0, DateTimeKind.Utc);
        await CreateAppointmentAsync(master.Id, service, apptStart);

        // Search period: 14:30 - 15:30 (should overlap with the 14:00-15:00 appointment)
        var searchStart = apptStart.AddMinutes(30);
        var searchEnd = apptStart.AddMinutes(90);

        // Act
        var result = await _sut.GetByMasterAndPeriodAsync(master.Id, searchStart, searchEnd);

        // Assert
        result.Should().ContainSingle();
    }

    [Fact]
    public async Task HasOverlapAsync_ShouldReturnTrue_WhenTimeConflicts()
    {
        // Arrange
        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id, "Haircut", 60);

        var existingStart = new DateTime(2026, 07, 01, 10, 0, 0, DateTimeKind.Utc);
        await CreateAppointmentAsync(master.Id, service, existingStart);

        // Act
        // Case: New appointment starts exactly when existing one ends (11:00) -> Should NOT overlap
        var edgeCaseOverlap = await _sut.HasOverlapAsync(master.Id, existingStart.AddHours(1), existingStart.AddHours(2));

        // Case: New appointment starts during existing one (10:30) -> Should overlap
        var realOverlap = await _sut.HasOverlapAsync(master.Id, existingStart.AddMinutes(30), existingStart.AddHours(2));

        // Assert
        edgeCaseOverlap.Should().BeFalse();
        realOverlap.Should().BeTrue();
    }

    [Fact]
    public async Task HasOverlapAsync_ShouldExcludeSpecificId_WhenUpdating()
    {
        // Arrange
        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id);
        var startTime = DateTime.UtcNow.AddDays(5);

        var appointment = await CreateAppointmentAsync(master.Id, service, startTime);

        // Act
        // Checking overlap for the exact same time but excluding itself
        var hasOverlap = await _sut.HasOverlapAsync(
            master.Id,
            appointment.StartTime,
            appointment.EndTime,
            appointment.Id);

        // Assert
        hasOverlap.Should().BeFalse();
    }

    [Fact]
    public async Task AddAsync_ShouldPersistAppointment()
    {
        // Arrange
        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id);
        var client = await CreateUserAsync();

        var appointment = new Appointment(client.Id, master.Id, service, DateTime.UtcNow.AddDays(1), "Notes");

        // Act
        await _sut.AddAsync(appointment);
        await context.SaveChangesAsync();

        // Assert
        var dbAppt = await context.Appointments.FindAsync(appointment.Id);
        dbAppt.Should().NotBeNull();
        dbAppt!.ClientNotes.Should().Be("Notes");
    }
}
