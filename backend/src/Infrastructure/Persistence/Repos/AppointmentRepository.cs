using Application.Common.Interfaces.Repos;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class AppointmentRepository(ApplicationDbContext context) : IAppointmentRepository
{
    public async Task<bool> HasOverlapAsync(Guid masterId, DateTime startTime, DateTime endTime, CancellationToken cancellationToken)
    {
        return await context.Appointments
            .AnyAsync(a =>
                    a.MasterId == masterId &&
                    a.Status == AppointmentStatus.Confirmed &&
                    a.StartTime < endTime &&
                    startTime < a.EndTime,
                cancellationToken);
    }

    public async Task<Appointment?> GetByIdAsync(Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Appointments
            .Include(a => a.Master)
            .Include(a => a.Service)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<List<Appointment>> GetByMasterAndDateAsync(Guid masterId, DateTime date, CancellationToken cancellationToken = default)
    {
        var startOfDay = date.Date.ToUniversalTime();
        var endOfDay = startOfDay.AddDays(1);

        return await context.Appointments
            .AsNoTracking()
            .Where(a =>
                a.MasterId == masterId &&
                a.Status != AppointmentStatus.Cancelled &&
                a.Status != AppointmentStatus.NoShow &&
                a.StartTime >= startOfDay &&
                a.StartTime < endOfDay)
            .OrderBy(a => a.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Appointment appointment, CancellationToken cancellationToken = default)
    {
        await context.Appointments.AddAsync(appointment, cancellationToken);
    }
}
