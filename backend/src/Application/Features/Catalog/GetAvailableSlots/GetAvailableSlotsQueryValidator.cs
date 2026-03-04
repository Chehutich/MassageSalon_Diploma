using FluentValidation;

namespace Application.Features.Catalog.GetAvailableSlots;

public class GetAvailableSlotsQueryValidator : AbstractValidator<GetAvailableSlotsQuery>
{
    public GetAvailableSlotsQueryValidator(TimeProvider timeProvider)
    {
        RuleFor(x => x.MasterId)
            .NotEmpty()
            .WithErrorCode("GetAvailableSlots.MasterId.Required");

        RuleFor(x => x.ServiceId)
            .NotEmpty()
            .WithErrorCode("GetAvailableSlots.ServiceId.Required");

        RuleFor(x => x.Date)
            .NotEmpty()
            .WithErrorCode("GetAvailableSlots.Date.Required")
            .Must(date => date.Date >= timeProvider.GetUtcNow().UtcDateTime.Date)
            .WithErrorCode("GetAvailableSlots.Date.Past");
    }
}
