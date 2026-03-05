using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Appointments.GetAppointmentDetails;

public record GetAppointmentDetailsQuery(Guid AppointmentId) : IRequest<Result<AppointmentDetailsDto, Error>>;

public class GetAppointmentDetailsHandler(
    IAppointmentRepository appointmentRepository,
    ICurrentUserContext userContext)
    : IRequestHandler<GetAppointmentDetailsQuery, Result<AppointmentDetailsDto, Error>>
{
    public async Task<Result<AppointmentDetailsDto, Error>> Handle(GetAppointmentDetailsQuery request, CancellationToken cancellationToken)
    {

        var appointment = await appointmentRepository.GetByIdWithDetailsAsync(request.AppointmentId, cancellationToken);

        if (appointment == null)
        {
            return Errors.Appointment.NotFound(request.AppointmentId);
        }

        if (appointment.ClientId != userContext.Id)
        {
            return Errors.Appointment.NotFound(appointment.Id);
        }

        var dto = new AppointmentDetailsDto(
            appointment.Id,
            appointment.StartTime,
            appointment.EndTime,
            appointment.Status.ToString(),
            appointment.ClientNotes,
            appointment.Service.Id,
            appointment.Service.Title,
            appointment.Service.Price,
            appointment.Service.Duration,
            appointment.Master.Id,
            appointment.Master.User.FirstName,
            appointment.Master.User.LastName,
            appointment.Master.PhotoUrl
        );

        return dto;
    }
}
