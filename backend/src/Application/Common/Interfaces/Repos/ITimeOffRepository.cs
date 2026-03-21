using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface ITimeOffRepository
{
    Task<bool> IsMasterOnTimeOffAsync(Guid masterId, DateTime date, CancellationToken cancellationToken = default);

    Task<List<TimeOff>> GetByMasterIdAsync(
        Guid masterId,
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default);
}
