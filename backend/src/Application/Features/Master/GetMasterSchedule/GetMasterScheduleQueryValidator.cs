using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.Master.GetMasterSchedule;

public class GetMasterScheduleQueryValidator : AbstractValidator<GetMasterScheduleQuery>
{
    public GetMasterScheduleQueryValidator()
    {
        RuleFor(x => x.From)
            .LessThanOrEqualTo(DateTime.UtcNow.AddYears(2))
            .WithErrorCode(ValidationErrors.Time.InvalidTime);

        RuleFor(x => x.To)
            .GreaterThanOrEqualTo(x => x.From ?? DateTime.UtcNow.Date)
            .WithErrorCode(ValidationErrors.Time.InvalidTime)
            .When(x => x.To.HasValue);

        RuleFor(x => x)
            .Must(x => !x.From.HasValue || !x.To.HasValue || (x.To.Value - x.From.Value).TotalDays <= 31)
            .WithMessage(ValidationErrors.Time.MaxRange);
    }
}
