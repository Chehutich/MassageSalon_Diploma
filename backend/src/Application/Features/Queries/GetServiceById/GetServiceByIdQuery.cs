using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Queries.GetServiceById;

public record GetServiceByIdQuery(Guid Id) : IRequest<Result<ServiceDetailResponse, Error>>;

public class GetServiceByIdHandler(
    IServiceRepository serviceRepository,
    IMasterRepository masterRepository)
    : IRequestHandler<GetServiceByIdQuery, Result<ServiceDetailResponse, Error>>
{
    public async Task<Result<ServiceDetailResponse, Error>> Handle(GetServiceByIdQuery request, CancellationToken cancellationToken)
    {
        var service = await serviceRepository.GetByIdAsync(request.Id, cancellationToken);

        if (service is null)
        {
            return Errors.Service.NotFound(request.Id);
        }

        var mastersForService = await masterRepository.GetAllAsync(service.Id, cancellationToken);

        var response = new ServiceDetailResponse(
            service.Id,
            service.Title,
            service.Description,
            service.Duration,
            service.Price,
            service.Category.Title,
            mastersForService.Select(m => new MasterShortResponse(m.Id, m.User.FirstName, m.User.LastName, m.PhotoUrl)).ToList()
        );

        return response;
    }
}
