using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllActiveAsync(CancellationToken cancellationToken = default);
}
