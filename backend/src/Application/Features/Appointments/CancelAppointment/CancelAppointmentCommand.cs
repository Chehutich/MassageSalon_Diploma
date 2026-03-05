using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Appointments.CancelAppointment;

public record CancelAppointmentCommand(Guid AppointmentId) : IRequest<Result<Guid, Error>>;

public class CancelAppointmentCommandHandler(
    IAppointmentRepository appointmentRepository,
    IUnitOfWork unitOfWork,
    ICurrentUserContext userContext,
    TimeProvider timeProvider) : IRequestHandler<CancelAppointmentCommand, Result<Guid, Error>>
{
    public async Task<Result<Guid, Error>> Handle(CancelAppointmentCommand request, CancellationToken cancellationToken)
    {
        var appointment = await appointmentRepository.GetByIdAsync(request.AppointmentId, cancellationToken);
        if (appointment == null)
        {
            return Errors.Appointment.NotFound(request.AppointmentId);
        }

        if (appointment.ClientId != userContext.Id)
        {
            return Errors.Appointment.NotFound(appointment.Id);
        }

        var now = timeProvider.GetUtcNow().UtcDateTime;
        if (appointment.StartTime < now.AddHours(1))
        {
            return Errors.Appointment.TooLateToCancel;
        }
        appointment.Cancel();

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return appointment.Id;
    }
}
