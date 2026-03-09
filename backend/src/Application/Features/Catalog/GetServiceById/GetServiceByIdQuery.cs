using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Catalog.GetServiceById;

public record GetServiceByIdQuery(Guid Id) : IRequest<Result<ServiceDetailsResponse, Error>>;

public class GetServiceByIdHandler(
    IServiceRepository serviceRepository,
    IMasterRepository masterRepository)
    : IRequestHandler<GetServiceByIdQuery, Result<ServiceDetailsResponse, Error>>
{
    public async Task<Result<ServiceDetailsResponse, Error>> Handle(GetServiceByIdQuery request, CancellationToken cancellationToken)
    {
        var service = await serviceRepository.GetByIdAsync(request.Id, cancellationToken);

        if (service is null)
        {
            return Errors.Service.NotFound(request.Id);
        }

        var mastersForService = await masterRepository.GetAllWithDetailsAsync(service.Id, cancellationToken);

        var response = new ServiceDetailsResponse(
            service.Id,
            service.Title,
            service.Description,
            service.Duration,
            service.Price,
            service.Category.Slug,
            service.Badge?.ToString(),
            service.Benefits,
            mastersForService.Select(m => new MasterShortResponse(m.Id, m.User.FirstName, m.User.LastName, m.User.PhotoUrl)).ToList()
        );

        return response;
    }
}
