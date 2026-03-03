using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface IMasterRepository
{
    Task<List<Master>> GetAllAsync(Guid? serviceId = null, CancellationToken cancellationToken = default);
}
