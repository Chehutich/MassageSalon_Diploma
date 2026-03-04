using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.Appointments.CreateAppointment;

public class CreateAppointmentCommandValidator : AbstractValidator<CreateAppointmentCommand>
{
    public CreateAppointmentCommandValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithErrorCode(ValidationErrors.Service.IdRequired);

        RuleFor(x => x.MasterId)
            .NotEmpty().WithErrorCode(ValidationErrors.Master.IdRequired);

        RuleFor(x => x.StartTime)
            .NotEmpty().WithErrorCode(ValidationErrors.Appointment.StartTimeRequired)
            .GreaterThan(DateTime.Now).WithErrorCode(ValidationErrors.Appointment.StartTimeInvalid);
    }
}
