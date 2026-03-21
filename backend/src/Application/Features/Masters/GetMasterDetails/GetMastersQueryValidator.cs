using Application.Common.Constants;
using FluentValidation;

namespace Application.Features.Masters.GetMasterDetails;

public class GetMasterDetailsQueryValidator : AbstractValidator<GetMasterDetailsQuery>
{
    public GetMasterDetailsQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEqual(Guid.Empty).WithErrorCode(ValidationErrors.Master.IdRequired);
    }
}
