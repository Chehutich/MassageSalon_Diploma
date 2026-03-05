using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using CSharpFunctionalExtensions;
using MediatR;

namespace Application.Features.Appointments.GetMyAppointments;

public record GetMyAppointmentsQuery() : IRequest<Result<List<MyAppointmentDto>>>;

public class GetMyAppointmentsQueryHandler(
    IAppointmentRepository appointmentRepository,
    ICurrentUserContext userProvider)
    : IRequestHandler<GetMyAppointmentsQuery, Result<List<MyAppointmentDto>>>
{
    public async Task<Result<List<MyAppointmentDto>>> Handle(
        GetMyAppointmentsQuery request,
        CancellationToken cancellationToken)
    {
        var userId = userProvider.Id;

        var appointments = await appointmentRepository.GetAppointmentsByUserId(userId, cancellationToken);

        var dtos = appointments.Select(a => new MyAppointmentDto(
            a.Id,
            a.StartTime,
            a.EndTime,
            a.ServiceId,
            a.Service.Title,
            a.MasterId,
            a.Master.User.FirstName,
            a.Master.User.LastName,
            a.Status.ToString(),
            a.ClientNotes
        )).ToList();

        return dtos;
    }
}
