using Application.Common.Interfaces.Repos;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class MasterRepository(ApplicationDbContext context) : IMasterRepository
{
    public async Task<Master?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Masters
            .Include(m => m.User)
            .Include(m => m.Services)
            .ThenInclude(s => s.Category)
            .FirstOrDefaultAsync(m => m.Id == id && m.IsActive, cancellationToken);
    }

    public async Task<List<Master>> GetAllWithDetailsAsync(Guid? serviceId = null, CancellationToken cancellationToken = default)
    {
        var query = context.Masters
            .Include(m => m.User)
            .Include(m => m.Services)
            .ThenInclude(s => s.Category)
            .Where(m => m.IsActive);

        if (serviceId.HasValue)
        {
            query = query.Where(m => m.Services.Any(s => s.Id == serviceId.Value));
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Master?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Masters
            .Where(m => m.Id == id)
            .Include(m => m.User)
            .Include(m => m.Services)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Schedule?> GetScheduleForDayAsync(Guid masterId,
        int dayOfWeek,
        CancellationToken cancellationToken = default)
    {
        return await context.Schedules
            .FirstOrDefaultAsync(s =>
                    s.MasterId == masterId &&
                    s.DayOfWeek == dayOfWeek,
                cancellationToken);
    }

    public async Task<bool> IsOnTimeOffAsync(Guid masterId,
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        var dateOnly = DateOnly.FromDateTime(date);

        return await context.TimeOffs
            .AnyAsync(to =>
                    to.MasterId == masterId &&
                    to.StartDate <= dateOnly &&
                    to.EndDate >= dateOnly,
                cancellationToken);
    }

    public async Task<List<Schedule>> GetSchedulesForMasterAsync(Guid masterId, CancellationToken cancellationToken = default)
    {
        return await context.Schedules
            .Where(s => s.MasterId == masterId)
            .OrderBy(s => s.DayOfWeek)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsMasterAvailableAsync(Guid masterId,
        DateTime start,
        DateTime end,
        Guid? excludeAppointmentId = null,
        CancellationToken cancellationToken = default)
    {
        // Check our working schedule
        var dbDayOfWeek = start.DayOfWeek;
        var startTime = TimeOnly.FromDateTime(start);
        var endTime = TimeOnly.FromDateTime(end);

        var worksThatDay = await context.Schedules
            .AnyAsync(s =>
                    s.MasterId == masterId &&
                    s.DayOfWeek == (int)dbDayOfWeek &&
                    s.StartTime <= startTime &&
                    s.EndTime >= endTime,
                cancellationToken);

        if (!worksThatDay)
        {
            return false;
        }

        if (await IsOnTimeOffAsync(masterId, start, cancellationToken))
        {
            return false;
        }

        // Check for any appointments that overlap
        var hasOverlap = await context.Appointments
            .AnyAsync(a =>
                    a.MasterId == masterId &&
                    a.Status != AppointmentStatus.Cancelled &&
                    a.Status != AppointmentStatus.NoShow &&
                    (excludeAppointmentId == null || a.Id != excludeAppointmentId) &&
                    a.StartTime < end &&
                    start < a.EndTime,
                cancellationToken);

        return !hasOverlap;
    }
}
