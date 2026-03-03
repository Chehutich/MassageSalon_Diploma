using Domain.Entities;
using FluentAssertions;
using Infrastructure.Persistence.Repos;
using Xunit;

namespace InfrastructureTests.Repos;

public class MasterRepositoryTests : BaseRepositoryTest
{
    private readonly MasterRepository _repository;

    public MasterRepositoryTests()
    {
        _repository = new MasterRepository(context);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnActiveMastersWithUsers()
    {
        // Arrange
        var user = await CreateUserAsync("john@test.com", "+1234567890");
        var master = await CreateMasterAsync(user);

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(1);

        result.First().User.FirstName.Should().Be("FirstName");
        result.First().Bio.Should().Be("Expert bio");
    }

    [Fact]
    public async Task GetAllAsync_WithServiceId_ShouldFilterMasters()
    {
        // Arrange
        var category = await CreateCategoryAsync("Body");
        var service1 = await CreateServiceAsync(category.Id, "Massage 1");
        var service2 = await CreateServiceAsync(category.Id, "Massage 2");

        var user1 = await CreateUserAsync("m1@test.com", "+111");
        var user2 = await CreateUserAsync("m2@test.com", "+222");

        var master1 = await CreateMasterAsync(user1);
        var master2 = await CreateMasterAsync(user2);


        master1.UpdateServices(new List<Service> { service1 });
        master2.UpdateServices(new List<Service> { service2 });

        await context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync(service1.Id);

        // Assert
        result.Should().HaveCount(1);

        result.First().Id.Should().Be(master1.Id);
        result.First().User.Email.Should().Be("m1@test.com");
    }

    [Fact]
    public async Task IsMasterAvailableAsync_ShouldReturnFalse_WhenOutsideSchedule()
    {
        // Arrange
        var master = await CreateMasterAsync();
        // Master works from 10:00 to 18:00 on Mondays (0)
        await CreateScheduleAsync(master.Id, 0, new TimeOnly(10, 0, 0), new TimeOnly(18, 0, 0));

        // Monday, 18:30 (already closed)
        var start = new DateTime(2026, 3, 2, 18, 30, 0, DateTimeKind.Utc);
        var end = start.AddMinutes(30);

        // Act
        var result = await _repository.IsMasterAvailableAsync(master.Id, start, end, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsMasterAvailableAsync_ShouldReturnFalse_WhenMasterOnTimeOff()
    {
        // Arrange
        var master = await CreateMasterAsync();
        await CreateScheduleAsync(master.Id, 0, new TimeOnly(9, 0, 0), new TimeOnly(21, 0, 0));

        // Time off for 2 days
        var timeOff = await CreateTimeOffAsync(master.Id, new DateOnly(2026, 3, 2), new DateOnly(2026, 3, 2));

        var start = new DateTime(2026, 3, 2, 12, 0, 0, DateTimeKind.Utc);
        var end = start.AddHours(1);

        // Act
        var result = await _repository.IsMasterAvailableAsync(master.Id, start, end, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsMasterAvailableAsync_ShouldHandleOverlappingAppointments()
    {
        // Arrange
        var testDate = DateTime.UtcNow.Date.AddDays(1);
        var dbDayOfWeek = (int)testDate.DayOfWeek;

        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id);
        await CreateScheduleAsync(master.Id, dbDayOfWeek, new TimeOnly(0, 0), new TimeOnly(23, 59));

        // Existing appointment: 12:00 - 13:00
        var existingStart = testDate.AddHours(12);

        _ = await CreateAppointmentAsync(master.Id, service, existingStart);

        // Act
        // Test 1: New appointment overlaps existing one (12:30 - 13:30)
        var resultInternal = await _repository.IsMasterAvailableAsync(
            master.Id, existingStart.AddMinutes(30), existingStart.AddMinutes(90), CancellationToken.None);

        // Test 2: New appointment just before old one (11:00 - 12:00) -> Edge case
        var resultEdge = await _repository.IsMasterAvailableAsync(
            master.Id, existingStart.AddHours(-1), existingStart, CancellationToken.None);

        // Assert
        resultInternal.Should().BeFalse();
        resultEdge.Should().BeTrue();
    }

    [Fact]
    public async Task IsMasterAvailableAsync_ShouldReturnTrue_WhenExactlyOnScheduleBorders()
    {
        // Arrange
        var testDate = DateTime.UtcNow.Date.AddDays(1);
        var dbDayOfWeek = (int)testDate.DayOfWeek;

        var master = await CreateMasterAsync();
        // Master works from 10:00 to 18:00 on Mondays (0)
        await CreateScheduleAsync(master.Id, dbDayOfWeek, new TimeOnly(10, 0, 0), new TimeOnly(18, 0, 0));

        // Act 1: Appointment just before opening (10:00 - 11:00)
        var startOpening = testDate.AddHours(10);
        var resultOpening = await _repository.IsMasterAvailableAsync(master.Id, startOpening, startOpening.AddHours(1), CancellationToken.None);

        // Act 2: Appointment just after closing (17:00 - 18:00)
        var startClosing = testDate.AddHours(17);
        var resultClosing = await _repository.IsMasterAvailableAsync(master.Id, startClosing, startClosing.AddHours(1), CancellationToken.None);

        // Act 3: Appointment exactly on the border (17:30 - 18:00)
        var startTooLate = testDate.AddHours(17).AddMinutes(30);
        var resultTooLate = await _repository.IsMasterAvailableAsync(master.Id, startTooLate, startTooLate.AddHours(1), CancellationToken.None);

        // Assert
        resultOpening.Should().BeTrue();
        resultClosing.Should().BeTrue();
        resultTooLate.Should().BeFalse();
    }

    [Fact]
    public async Task IsMasterAvailableAsync_ShouldHandleComplexOverlaps()
    {
        // Arrange
        var testDate = DateTime.UtcNow.Date.AddDays(1);
        var dbDayOfWeek = (int)testDate.DayOfWeek;

        var master = await CreateMasterAsync();
        var category = await CreateCategoryAsync();
        var service = await CreateServiceAsync(category.Id);
        await CreateScheduleAsync(master.Id, dbDayOfWeek, new TimeOnly(0, 0), new TimeOnly(23, 59));

        // Existing appointment: 12:00 - 13:00
        var existingStart = testDate.AddHours(12);
        var existingEnd = existingStart.AddHours(1);
        await CreateAppointmentAsync(master.Id, service, existingStart);

        // Act & Assert

        // Case 1: Total encapsulation (11:30 - 13:30) -> False
        var isEncapsulating = await _repository.IsMasterAvailableAsync(
            master.Id, existingStart.AddMinutes(-30), existingEnd.AddMinutes(30), CancellationToken.None);
        isEncapsulating.Should().BeFalse();

        // Case 2: Appointment in another one (12:15 - 12:45) -> False
        var isInside = await _repository.IsMasterAvailableAsync(
            master.Id, existingStart.AddMinutes(15), existingEnd.AddMinutes(-15), CancellationToken.None);
        isInside.Should().BeFalse();

        // Case 3: Border to border after (13:00 - 14:00) -> True
        var isAfter = await _repository.IsMasterAvailableAsync(
            master.Id, existingEnd, existingEnd.AddHours(1), CancellationToken.None);
        isAfter.Should().BeTrue();

        // Case 4: Total match (12:00 - 13:00) -> False
        var isExactMatch = await _repository.IsMasterAvailableAsync(
            master.Id, existingStart, existingEnd, CancellationToken.None);
        isExactMatch.Should().BeFalse();
    }
}
