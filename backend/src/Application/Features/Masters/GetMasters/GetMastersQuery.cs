using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using MediatR;

namespace Application.Features.Masters.GetMasters;

public record GetMastersQuery(Guid? ServiceId = null) : IRequest<Result<List<MasterResponse>>>;

public class GetMastersHandler(IMasterRepository masterRepository)
    : IRequestHandler<GetMastersQuery, Result<List<MasterResponse>>>
{
    public async Task<Result<List<MasterResponse>>> Handle(GetMastersQuery request, CancellationToken cancellationToken)
    {
        var masters = await masterRepository.GetAllWithDetailsAsync(request.ServiceId, cancellationToken);

        var dtos = masters.Select(m => new MasterResponse(
            m.Id,
            m.User.FirstName,
            m.User.LastName,
            m.User.PhotoUrl,
            m.Bio,
            m.Services
                .Select(s => s.Category)
                .DistinctBy(c => c.Id)
                .Select(c => new CategoryResponse(c.Id, c.Title))
                .ToList()
        )).ToList();

        return dtos;
    }
}
