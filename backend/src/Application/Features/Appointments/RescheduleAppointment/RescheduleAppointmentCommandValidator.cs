using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.Appointments.RescheduleAppointment;

public class RescheduleAppointmentCommandValidator : AbstractValidator<RescheduleAppointmentCommand>
{
    public RescheduleAppointmentCommandValidator(TimeProvider timeProvider)
    {
        RuleFor(x => x.AppointmentId)
            .NotEmpty().WithErrorCode(ValidationErrors.Appointment.IdRequired);

        RuleFor(x => x.NewStartTime)
            .NotEmpty().WithErrorCode(ValidationErrors.Appointment.NewStartTimeRequired)
            .Must(newStartTime =>
            {
                var minAllowedTime = timeProvider.GetUtcNow().UtcDateTime.AddHours(2);
                return newStartTime >= minAllowedTime;
            })
            .WithErrorCode(ValidationErrors.Appointment.NewStartTimeInvalid);
    }
}
