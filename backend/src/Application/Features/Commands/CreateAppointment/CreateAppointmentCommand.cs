using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using CSharpFunctionalExtensions;
using Domain.Entities;
using Domain.Errors;
using MediatR;

namespace Application.Features.Commands.CreateAppointment;

public record CreateAppointmentCommand(
    Guid ServiceId,
    Guid MasterId,
    DateTime StartTime,
    string? Notes = null) : IRequest<Result<Guid, Error>>;

public class CreateAppointmentHandler(
    IAppointmentRepository appointmentRepository,
    IServiceRepository serviceRepository,
    IMasterRepository masterRepository,
    IUnitOfWork unitOfWork,
    ICurrentUserContext userContext)
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

        var isAvailable = await masterRepository.IsMasterAvailableAsync(
            request.MasterId,
            request.StartTime,
            endTime,
            cancellationToken);

        if (!isAvailable)
        {
            return Errors.Appointment.Conflict;
        }

        var appointment = new Appointment(
            userContext.Id,
            request.MasterId,
            service,
            request.StartTime,
            request.Notes
        );

        await appointmentRepository.AddAsync(appointment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return appointment.Id;
    }
}
