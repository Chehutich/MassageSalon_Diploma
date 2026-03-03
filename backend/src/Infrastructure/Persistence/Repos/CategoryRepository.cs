using Application.Common.Interfaces.Repos;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class CategoryRepository(ApplicationDbContext context) : ICategoryRepository
{
    public async Task<List<Category>> GetAllActiveAsync(CancellationToken cancellationToken)
    {
        return await context.Categories
            .Where(c => c.IsActive)
            .ToListAsync(cancellationToken);
    }

    public Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task AddAsync(Category category, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
