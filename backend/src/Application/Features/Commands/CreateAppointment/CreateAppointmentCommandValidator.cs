using FluentValidation;

namespace Application.Features.Commands.CreateAppointment;

public class CreateAppointmentCommandValidator : AbstractValidator<CreateAppointmentCommand>
{
    public CreateAppointmentCommandValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithErrorCode("Service.Id.Required");

        RuleFor(x => x.MasterId)
            .NotEmpty().WithErrorCode("Master.Id.Required");

        RuleFor(x => x.StartTime)
            .NotEmpty().WithErrorCode("Appointment.StartTime.Required")
            .GreaterThan(DateTime.Now).WithErrorCode("Appointment.StartTime.Invalid");
    }
}
