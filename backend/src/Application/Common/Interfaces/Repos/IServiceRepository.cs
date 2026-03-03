using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface IServiceRepository
{
    Task<List<Service>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Service?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
