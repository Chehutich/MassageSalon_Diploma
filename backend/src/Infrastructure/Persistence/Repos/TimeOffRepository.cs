using Application.Common.Interfaces.Repos;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class TimeOffRepository(ApplicationDbContext context) : ITimeOffRepository
{
    public async Task<bool> IsMasterOnTimeOffAsync(
        Guid masterId,
        DateTime timeOffDate,
        CancellationToken cancellationToken = default)
    {
        var dateOnly = DateOnly.FromDateTime(timeOffDate);

        return await context.TimeOffs
            .AnyAsync(to =>
                    to.MasterId == masterId &&
                    to.StartDate <= dateOnly &&
                    to.EndDate >= dateOnly,
                cancellationToken);
    }

    public async Task<List<TimeOff>> GetByMasterIdAsync(
        Guid masterId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var fromDate = DateOnly.FromDateTime(startDate);
        var toDate = DateOnly.FromDateTime(endDate);

        return await context.TimeOffs
            .Where(t => t.MasterId == masterId &&
                         t.EndDate >= fromDate &&
                         t.StartDate <= toDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<TimeOff>> GetByMasterAndPeriodAsync(
        Guid masterId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        return await context.TimeOffs
            .Where(t => t.MasterId == masterId &&
                        t.StartDate <= endDate&&
                        t.EndDate >= startDate)
            .ToListAsync(cancellationToken);
    }
}
