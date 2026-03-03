using Application.Common.Interfaces.Repos;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class MasterRepository(ApplicationDbContext context) : IMasterRepository
{
    public async Task<List<Master>> GetAllAsync(Guid? serviceId = null, CancellationToken cancellationToken = default)
    {
        var query = context.Masters
            .Include(m => m.User)
            .Where(m => m.IsActive);

        if (serviceId.HasValue)
        {
            query = query.Where(m => m.Services.Any(s => s.Id == serviceId.Value));
        }

        return await query.ToListAsync(cancellationToken);
    }
}
