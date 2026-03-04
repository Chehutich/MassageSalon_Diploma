using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllActiveAsync(CancellationToken cancellationToken = default);

    Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Category category, CancellationToken cancellationToken = default);
}
