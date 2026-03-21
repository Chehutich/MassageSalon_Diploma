using Application.Common.Interfaces.Repos;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class ScheduleRepository(ApplicationDbContext context) : IScheduleRepository
{
    public async Task<Schedule?> GetScheduleForDayAsync(
        Guid masterId,
        int dayOfWeek,
        CancellationToken cancellationToken = default)
    {
        return await context.Schedules
            .FirstOrDefaultAsync(s =>
                    s.MasterId == masterId &&
                    s.DayOfWeek == dayOfWeek,
                cancellationToken);
    }

    public async Task<List<Schedule>> GetSchedulesForMasterAsync(
        Guid masterId,
        CancellationToken cancellationToken = default)
    {
        return await context.Schedules
            .Where(s => s.MasterId == masterId)
            .OrderBy(s => s.DayOfWeek)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsMasterWorkingAtAsync(
        Guid masterId,
        int dayOfWeek,
        TimeOnly start,
        TimeOnly end,
        CancellationToken cancellationToken = default)
    {
        return await context.Schedules
            .AnyAsync(s =>
                    s.MasterId == masterId &&
                    s.DayOfWeek == dayOfWeek &&
                    s.StartTime <= start &&
                    s.EndTime >= end,
                cancellationToken);
    }

    public async Task<List<Schedule>> GetByMasterIdAsync(
        Guid masterId,
        CancellationToken cancellationToken = default)
    {
        return await context.Schedules
            .Where(s => s.MasterId == masterId)
            .ToListAsync(cancellationToken);
    }
}
