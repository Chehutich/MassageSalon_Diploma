using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.Catalog.GetAvailableDates;

public class GetAvailableDatesQueryValidator : AbstractValidator<GetAvailableDatesQuery>
{
    public GetAvailableDatesQueryValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty()
            .WithErrorCode(ValidationErrors.GetAvailableDates.ServiceIdRequired);

        RuleFor(x => x.Year)
            .NotEmpty()
            .WithErrorCode(ValidationErrors.GetAvailableDates.YearRequired);

        RuleFor(x => x.Month)
            .NotEmpty()
            .WithErrorCode(ValidationErrors.GetAvailableDates.MonthRequired);

        RuleFor(x => x.MasterId)
            .NotEqual(Guid.Empty).When(x => x.MasterId.HasValue)
            .WithErrorCode(ValidationErrors.GetAvailableDates.MasterIdNotEmpty);
    }
}
