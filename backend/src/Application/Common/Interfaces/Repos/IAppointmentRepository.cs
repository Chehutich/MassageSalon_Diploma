using Domain.Entities;

namespace Application.Common.Interfaces.Repos;

public interface IAppointmentRepository
{
    Task<bool> HasOverlapAsync(Guid masterId,
        DateTime startTime,
        DateTime endTime,
        CancellationToken cancellationToken);

    Task<List<Appointment>> GetByMasterAndDateAsync(Guid masterId, DateTime date, CancellationToken cancellationToken);

    Task AddAsync(Appointment appointment, CancellationToken cancellationToken);
}
