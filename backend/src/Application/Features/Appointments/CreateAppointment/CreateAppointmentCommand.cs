using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Events;
using CSharpFunctionalExtensions;
using Domain.Entities;
using Domain.Errors;
using MediatR;

namespace Application.Features.Appointments.CreateAppointment;

public record CreateAppointmentCommand(
    Guid ServiceId,
    Guid? MasterId,
    DateTime StartTime,
    string? Notes = null) : IRequest<Result<Guid, Error>>;

public class CreateAppointmentHandler(
    IAppointmentRepository appointmentRepository,
    IServiceRepository serviceRepository,
    IMasterRepository masterRepository,
    ISlotService slotService,
    IUnitOfWork unitOfWork,
    ICurrentUserContext userContext,
    IPublisher publisher)
    : IRequestHandler<CreateAppointmentCommand, Result<Guid, Error>>
{
    public async Task<Result<Guid, Error>> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
    {
        var service = await serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        if (service == null)
        {
            return Errors.Service.NotFound(request.ServiceId);
        }

        var endTime = request.StartTime.AddMinutes(service.Duration);
        Guid finalMasterId;

        if (request.MasterId.HasValue)
        {
            var isAvailable = await slotService.IsMasterAvailableAsync(
                request.MasterId.Value, request.StartTime, endTime, null, cancellationToken);

            if (!isAvailable)
            {
                return Errors.Appointment.Conflict;
            }

            finalMasterId = request.MasterId.Value;
        }

        else
        {
            var masters = await masterRepository.GetAllWithDetailsAsync(request.ServiceId, cancellationToken);

            Domain.Entities.Master? availableMaster = null;
            foreach (var m in masters)
            {
                if (await slotService.IsMasterAvailableAsync(m.Id, request.StartTime, endTime, null, cancellationToken))
                {
                    availableMaster = m;
                    break;
                }
            }

            if (availableMaster == null)
            {
                return Errors.Appointment.Conflict;
            }

            finalMasterId = availableMaster.Id;
        }

        var appointment = new Appointment(
            userContext.Id,
            finalMasterId,
            service,
            request.StartTime,
            request.Notes
        );

        await appointmentRepository.AddAsync(appointment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        //
        await publisher.Publish(new AppointmentCreatedEvent(appointment.Id), cancellationToken);

        return appointment.Id;
    }
}
