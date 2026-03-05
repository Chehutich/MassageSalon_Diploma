using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.Appointments.CreateAppointment;

public class CreateAppointmentCommandValidator : AbstractValidator<CreateAppointmentCommand>
{
    private const int TimeStep = 30;

    public CreateAppointmentCommandValidator(TimeProvider timeProvider)
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithErrorCode(ValidationErrors.Service.IdRequired);

        RuleFor(x => x.MasterId)
            .NotEqual(Guid.Empty).When(x => x.MasterId.HasValue);

        RuleFor(x => x.StartTime)
            .NotEmpty().WithErrorCode(ValidationErrors.Appointment.StartTimeRequired)
            .Must(startTime =>
            {
                var now = timeProvider.GetUtcNow().UtcDateTime;
                return startTime >= now.AddHours(1);
            })
            .WithErrorCode(ValidationErrors.Appointment.StartTimeInvalid)
            .Must(startTime => startTime.Minute % TimeStep == 0)
            .WithErrorCode(ValidationErrors.Appointment.StartTimeInvalid);
    }
}
