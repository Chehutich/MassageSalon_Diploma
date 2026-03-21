using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.Masters.GetMasters;

public class GetMastersQueryValidator : AbstractValidator<GetMastersQuery>
{
    public GetMastersQueryValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEqual(Guid.Empty).When(x => x.ServiceId.HasValue).WithErrorCode(ValidationErrors.Service.IdRequired);
    }
}
