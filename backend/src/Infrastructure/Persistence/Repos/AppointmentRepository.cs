using Application.Common.Interfaces.Repos;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repos;

public class AppointmentRepository(ApplicationDbContext context) : IAppointmentRepository
{
    public async Task<Appointment?> GetByIdAsync(
        Guid id,
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
            .Include(a => a.Client)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<List<Appointment>> GetByUserId(
        Guid userId,
        CancellationToken cancellationToken = default)
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

    public async Task<List<Appointment>> GetByMasterAndDateAsync(
        Guid masterId,
        DateTime dateTime,
        CancellationToken cancellationToken = default)
    {
        var startOfDay = dateTime.Date.ToUniversalTime();
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

    public async Task<List<Appointment>> GetMasterScheduleAsync(
        Guid masterId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        return await context.Appointments
            .AsNoTracking()
            .Where(a => a.MasterId == masterId &&
                        a.StartTime >= startDate &&
                        a.StartTime < endDate)
            .Include(a => a.Service)
            .Include(a => a.Client)
            .Include(a => a.Master)
            .ThenInclude(m => m.User)
            .OrderBy(a => a.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Appointment>> GetByMasterAndPeriodAsync(
        Guid masterId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        return await context.Appointments
            .Where(a => a.MasterId == masterId &&
                        a.StartTime < endDate &&
                        a.EndTime > startDate &&
                        a.Status != AppointmentStatus.Cancelled)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasOverlapAsync(
        Guid masterId,
        DateTime startDate,
        DateTime endDate,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        return await context.Appointments
            .AnyAsync(a =>
                    a.MasterId == masterId &&
                    a.Status != AppointmentStatus.Cancelled &&
                    a.Status != AppointmentStatus.NoShow &&
                    (excludeId == null || a.Id != excludeId) &&
                    a.StartTime < endDate &&
                    startDate < a.EndTime,
                cancellationToken);
    }

    public async Task AddAsync(Appointment appointment, CancellationToken cancellationToken = default)
    {
        await context.Appointments.AddAsync(appointment, cancellationToken);
    }
}
