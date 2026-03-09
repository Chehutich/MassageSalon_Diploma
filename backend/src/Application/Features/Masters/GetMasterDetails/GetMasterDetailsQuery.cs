using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Masters.GetMasterDetails;

public record GetMasterDetailsQuery(Guid Id) : IRequest<Result<MasterDetailsResponse, Error>>;

public class GetMasterDetailsHandler(IMasterRepository masterRepository)
    : IRequestHandler<GetMasterDetailsQuery, Result<MasterDetailsResponse, Error>>
{
    public async Task<Result<MasterDetailsResponse, Error>> Handle(GetMasterDetailsQuery request, CancellationToken cancellationToken)
    {
        var master = await masterRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);

        if (master == null)
        {
            return Errors.Master.NotFound(request.Id);
        }

        return new MasterDetailsResponse(
            master.Id,
            master.User.FirstName,
            master.User.LastName,
            master.User.PhotoUrl,
            master.Bio,
            master.Services.Select(s => new ServiceResponse(
                s.Id,
                s.Title,
                s.Description,
                s.Duration,
                s.Price,
                s.Badge?.ToString(),
                s.Category.Slug
            )).ToList()
        );
    }
}
