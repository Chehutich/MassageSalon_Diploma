using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface IScheduleRepository
{
    Task<Schedule?> GetScheduleForDayAsync(
        Guid masterId,
        int dayOfWeek,
        CancellationToken cancellationToken = default);

    Task<List<Schedule>> GetSchedulesForMasterAsync(Guid masterId, CancellationToken cancellationToken = default);

    Task<bool> IsMasterWorkingAtAsync(
        Guid masterId,
        int dayOfWeek,
        TimeOnly start,
        TimeOnly end,
        CancellationToken cancellationToken = default);

    Task<List<Schedule>> GetByMasterIdAsync(
        Guid masterId,
        CancellationToken cancellationToken = default);
}
