using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface IMasterRepository
{
    Task<Master?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<Master>> GetAllWithDetailsAsync(Guid? serviceId = null, CancellationToken cancellationToken = default);

    Task<Master?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Master?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
