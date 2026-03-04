using FluentValidation;

namespace Application.Features.Catalog.GetServiceById;

public class GetServiceByIdQueryValidator : AbstractValidator<GetServiceByIdQuery>
{
    public GetServiceByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithErrorCode("Service.Id.Required");
    }
}
