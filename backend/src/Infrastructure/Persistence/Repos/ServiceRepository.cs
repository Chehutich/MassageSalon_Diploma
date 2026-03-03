using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class ServiceRepository(ApplicationDbContext context) : IServiceRepository
{
    public async Task<List<Service>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Services
            .Include(s => s.Category)
            .Where(s => s.IsActive && s.Category.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<Service?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Services
            .Include(s => s.Category)
            .FirstOrDefaultAsync(s => s.Id == id && s.IsActive && s.Category.IsActive, cancellationToken);
    }
}
