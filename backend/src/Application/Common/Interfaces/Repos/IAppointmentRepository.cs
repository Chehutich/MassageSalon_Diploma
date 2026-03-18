using Domain.Common;
using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface IAppointmentRepository
{
    Task<Appointment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Appointment?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<Appointment>> GetAppointmentsByUserId(Guid userId, CancellationToken cancellationToken = default);

    Task<List<Appointment>> GetByMasterAndDateAsync(
        Guid masterId,
        DateTime date,
        CancellationToken cancellationToken = default);

    Task<List<BusyInterval>> GetBusyIntervalsAsync(
        Guid masterId,
        DateTime start,
        DateTime end,
        CancellationToken cancellationToken = default);

    Task<List<Appointment>> GetMasterScheduleAsync(
        Guid masterId,
        DateTime start,
        DateTime end,
        CancellationToken cancellationToken = default);

    Task<bool> HasOverlapAsync(
        Guid masterId,
        DateTime start,
        DateTime end,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default);

    Task AddAsync(Appointment appointment, CancellationToken cancellationToken = default);
}
