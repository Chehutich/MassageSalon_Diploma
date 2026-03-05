using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface IMasterRepository
{
    Task<Master?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<Master>> GetAllWithDetailsAsync(Guid? serviceId = null, CancellationToken cancellationToken = default);

    Task<Master?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Schedule?> GetScheduleForDayAsync(Guid masterId,
        int dayOfWeek,
        CancellationToken cancellationToken = default);

    Task<bool> IsOnTimeOffAsync(Guid masterId, DateTime date, CancellationToken cancellationToken = default);

    Task<bool> IsMasterAvailableAsync(Guid masterId,
        DateTime start,
        DateTime end,
        Guid? excludeAppointmentId = null,
        CancellationToken cancellationToken = default);
}
