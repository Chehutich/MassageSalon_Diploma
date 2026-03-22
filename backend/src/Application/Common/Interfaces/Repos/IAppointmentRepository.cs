using Domain.Common;
using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface IAppointmentRepository
{
    Task<Appointment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Appointment?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<Appointment>> GetByUserId(Guid userId, CancellationToken cancellationToken = default);

    Task<List<Appointment>> GetByMasterAndDateAsync(
        Guid masterId,
        DateTime dateTime,
        CancellationToken cancellationToken = default);

    Task<List<Appointment>> GetMasterScheduleAsync(
        Guid masterId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    Task<List<Appointment>> GetByMasterAndPeriodAsync(Guid masterId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    Task<bool> HasOverlapAsync(
        Guid masterId,
        DateTime startDate,
        DateTime endDate,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default);

    Task AddAsync(Appointment appointment, CancellationToken cancellationToken = default);
}
