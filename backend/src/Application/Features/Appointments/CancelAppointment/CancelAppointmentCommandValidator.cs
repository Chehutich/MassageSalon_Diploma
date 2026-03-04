using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.Appointments.CancelAppointment;

public class CancelAppointmentCommandValidator : AbstractValidator<CancelAppointmentCommand>
{
    public CancelAppointmentCommandValidator()
    {
        RuleFor(x => x.AppointmentId)
            .NotEmpty().WithErrorCode(ValidationErrors.Appointment.IdRequired);
    }
}
