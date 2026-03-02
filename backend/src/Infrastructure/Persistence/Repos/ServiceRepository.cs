using Application.Common.Intefaces;
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
}
