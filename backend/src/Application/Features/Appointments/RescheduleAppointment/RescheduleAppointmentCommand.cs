using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Appointments.RescheduleAppointment;

public record RescheduleAppointmentCommand(
    Guid AppointmentId,
    DateTime NewStartTime) : IRequest<Result<Guid, Error>>;

public class RescheduleAppointmentCommandHandler(
    IAppointmentRepository appointmentRepository,
    ICurrentUserContext userContext,
    IMasterRepository masterRepository,
    IUnitOfWork unitOfWork,
    TimeProvider timeProvider) : IRequestHandler<RescheduleAppointmentCommand, Result<Guid, Error>>
{
    public async Task<Result<Guid, Error>> Handle(RescheduleAppointmentCommand request, CancellationToken cancellationToken)
    {
        // Find
        var appointment = await appointmentRepository.GetByIdAsync(request.AppointmentId, cancellationToken);
        if (appointment == null)
        {
            return Errors.Appointment.NotFound(request.AppointmentId);
        }

        if (appointment.ClientId != userContext.Id)
        {
            return Errors.Appointment.NotFound(appointment.Id);
        }

        var newEndTime = request.NewStartTime.AddMinutes(appointment.Service.Duration);

        // Check availability (send appointmentId to exclude)
        var isAvailable = await masterRepository.IsMasterAvailableAsync(
            appointment.MasterId,
            request.NewStartTime,
            newEndTime,
            excludeAppointmentId: appointment.Id,
            cancellationToken);

        if (!isAvailable)
        {
            return Errors.Appointment.Conflict;
        }

        // Check rule: Cannot move an appointment if it's less than 24 hours away
        var now = timeProvider.GetUtcNow().UtcDateTime;
        if (appointment.StartTime < now.AddHours(24))
        {
            return Errors.Appointment.TooLateToReschedule;
        }

        appointment.Reschedule(request.NewStartTime, newEndTime, now);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return appointment.Id;
    }
}
