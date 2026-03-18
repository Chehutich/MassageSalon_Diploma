using Application.Common.Interfaces.Repos;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class TimeOffsRepository(ApplicationDbContext context) : ITimeOffsRepository
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
}
