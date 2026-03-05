using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface IAppointmentRepository
{
    Task<Appointment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Appointment?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<Appointment>> GetAppointmentsByUserId(Guid userId, CancellationToken cancellationToken = default);

    Task<List<Appointment>> GetByMasterAndDateAsync(Guid masterId, DateTime date, CancellationToken cancellationToken = default);

    Task AddAsync(Appointment appointment, CancellationToken cancellationToken = default);
}
