using Application.Common.Intefaces;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Queries.GetService;

public record GetServicesQuery() : IRequest<Result<List<ServiceResponse>, Error>>;

public class GetServicesQueryHandler(IServiceRepository serviceRepository)
    : IRequestHandler<GetServicesQuery, Result<List<ServiceResponse>, Error>>
{
    public async Task<Result<List<ServiceResponse>, Error>> Handle(GetServicesQuery request, CancellationToken cancellationToken)
    {
        var services = await serviceRepository.GetAllAsync(cancellationToken);

        var response = services.Select(s => new ServiceResponse(
            s.Id,
            s.Title,
            s.Description,
            s.Duration,
            s.Price,
            s.Category.Title)).ToList();

        return response;
    }
}
