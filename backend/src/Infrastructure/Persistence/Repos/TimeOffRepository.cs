using Application.Common.Interfaces.Repos;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class TimeOffRepository(ApplicationDbContext context) : ITimeOffRepository
{
    public async Task<bool> IsMasterOnTimeOffAsync(
        Guid masterId,
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

    public async Task<List<TimeOff>> GetByMasterIdAsync(
        Guid masterId,
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default)
    {
        var fromDate = DateOnly.FromDateTime(from);
        var toDate = DateOnly.FromDateTime(to);

        return await context.TimeOffs
            .Where(t => t.MasterId == masterId &&
                         t.EndDate >= fromDate &&
                         t.StartDate <= toDate)
            .ToListAsync(cancellationToken);
    }
}
