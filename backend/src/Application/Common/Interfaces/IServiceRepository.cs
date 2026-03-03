using Domain.Entities;

namespace Application.Common.Interfaces;

public interface IServiceRepository
{
    Task<List<Service>> GetAllAsync(Guid? categoryId = null,CancellationToken cancellationToken = default);

    Task<Service?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
