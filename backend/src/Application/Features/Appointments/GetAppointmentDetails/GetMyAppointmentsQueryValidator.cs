using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.Appointments.GetAppointmentDetails;

public class GetMyAppointmentDetailsValidator : AbstractValidator<GetAppointmentDetailsQuery>
{
    public GetMyAppointmentDetailsValidator()
    {
        RuleFor(x => x.AppointmentId)
            .NotEmpty()
            .WithErrorCode(ValidationErrors.Appointment.IdRequired);
    }
}

