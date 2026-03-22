using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface ITimeOffRepository
{
    Task<bool> IsMasterOnTimeOffAsync(Guid masterId, DateTime timeOffDate, CancellationToken cancellationToken = default);

    Task<List<TimeOff>> GetByMasterIdAsync(
        Guid masterId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    Task<List<TimeOff>> GetByMasterAndPeriodAsync(Guid masterId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);
}
