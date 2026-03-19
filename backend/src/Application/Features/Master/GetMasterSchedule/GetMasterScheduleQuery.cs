using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using MediatR;

namespace Application.Features.Master.GetMasterSchedule;

public record GetMasterScheduleQuery(DateTime? From = null, DateTime? To = null)
    : IRequest<Result<List<AppointmentDetailsResponse>>>;

public class GetMasterScheduleHandler(
    IAppointmentRepository appointmentRepository,
    IMasterRepository masterRepository,
    ICurrentUserContext userContext,
    TimeProvider timeProvider)
    : IRequestHandler<GetMasterScheduleQuery, Result<List<AppointmentDetailsResponse>>>
{
    public async Task<Result<List<AppointmentDetailsResponse>>> Handle(
        GetMasterScheduleQuery request,
        CancellationToken cancellationToken)
    {
        var userId = userContext.Id;

        var master = await masterRepository.GetByUserIdAsync(userId, cancellationToken);

        if (master == null)
        {
            return Result.Success(new List<AppointmentDetailsResponse>());
        }

        var now = timeProvider.GetUtcNow().UtcDateTime;

        var from = request.From?.Date ?? now.Date;
        var to = request.To?.Date ?? from.AddDays(7);

        var appointments = await appointmentRepository.GetMasterScheduleAsync(
            master.Id, from, to, cancellationToken);

        var response = appointments.Select(a => new AppointmentDetailsResponse(
            a.Id,
            a.StartTime,
            a.EndTime,
            a.Status.ToString(),
            a.ClientNotes,
            a.Service.Id,
            a.Service.Title,
            a.Service.Price,
            a.Service.Duration,
            a.MasterId,
            a.Master.User.Id,
            a.Master.User.FirstName,
            a.Master.User.LastName,
            a.Master.User.Phone,
            a.ClientId,
            a.Client.FirstName,
            a.Client.LastName,
            a.Client.Phone,
            a.Client.Email,
            a.Client.PhotoUrl
        )).ToList();

        return Result.Success(response);
    }
}
