using Application.Common.Interfaces.Repos;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class AppointmentRepository(ApplicationDbContext context) : IAppointmentRepository
{
    public async Task<Appointment?> GetByIdAsync(Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Appointments
            .Include(a => a.Master)
            .Include(a => a.Service)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<Appointment?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Appointments
            .AsNoTracking()
            .Include(a => a.Service)
            .Include(a => a.Master)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<List<Appointment>> GetAppointmentsByUserId(Guid userId, CancellationToken cancellationToken = default)
    {
        return await context.Appointments
            .AsNoTracking()
            .Where(a => a.ClientId == userId)
            .Include(a => a.Service)
            .Include(a => a.Master)
                .ThenInclude(m => m.User)
            .OrderByDescending(a => a.StartTime)
            .ToListAsync(cancellationToken);
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

    public async Task<List<BusyInterval>> GetBusyIntervalsAsync(Guid masterId, DateTime start, DateTime end, CancellationToken cancellationToken = default)
    {
        var appointments = await context.Appointments
            .Where(a => a.MasterId == masterId &&
                        a.StartTime < end &&
                        a.EndTime > start &&
                        a.Status != AppointmentStatus.Cancelled)
            .Select(a => new BusyInterval(a.StartTime, a.EndTime))
            .ToListAsync(cancellationToken);

        var timeOffs = await context.TimeOffs
            .Where(t => t.MasterId == masterId &&
                        t.StartDate <= DateOnly.FromDateTime(end) &&
                        t.EndDate >= DateOnly.FromDateTime(start))
            .ToListAsync(cancellationToken);

        var timeOffIntervals = timeOffs.Select(t => new BusyInterval(
            t.StartDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc),
            t.EndDate.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc)
        ));

        return appointments
            .Concat(timeOffIntervals)
            .OrderBy(x => x.Start)
            .ToList();
    }

    public async Task AddAsync(Appointment appointment, CancellationToken cancellationToken = default)
    {
        await context.Appointments.AddAsync(appointment, cancellationToken);
    }
}
