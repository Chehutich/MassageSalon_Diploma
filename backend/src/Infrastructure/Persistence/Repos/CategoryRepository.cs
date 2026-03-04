using Application.Common.Interfaces.Repos;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class CategoryRepository(ApplicationDbContext context) : ICategoryRepository
{
    public async Task<List<Category>> GetAllActiveAsync(CancellationToken cancellationToken = default)
    {
        return await context.Categories
            .Where(c => c.IsActive)
            .ToListAsync(cancellationToken);
    }

    public Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}
