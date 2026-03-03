using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllActiveAsync(CancellationToken cancellationToken);

    Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task AddAsync(Category category, CancellationToken cancellationToken);
}
