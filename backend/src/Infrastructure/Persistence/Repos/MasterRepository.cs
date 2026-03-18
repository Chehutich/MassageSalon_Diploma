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

    public async Task<List<Master>> GetAllWithDetailsAsync(
        Guid? serviceId = null,
        CancellationToken cancellationToken = default)
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

    public async Task<Master?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await context.Masters
            .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);
    }
}
