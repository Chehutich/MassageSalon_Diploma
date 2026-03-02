using Domain.Entities;

namespace Application.Common.Intefaces;

public interface IServiceRepository
{
    Task<List<Service>> GetAllAsync(CancellationToken cancellationToken = default);
}
