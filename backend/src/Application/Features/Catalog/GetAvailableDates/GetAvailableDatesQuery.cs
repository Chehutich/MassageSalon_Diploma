using Application.Common.Interfaces;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Catalog.GetAvailableDates;

public record GetAvailableDatesQuery(Guid ServiceId, Guid? MasterId, int Year, int Month)
    : IRequest<Result<List<DateOnly>, Error>>;

public class GetAvailableDatesQueryHandler(
    ISlotService slotService) : IRequestHandler<GetAvailableDatesQuery, Result<List<DateOnly>, Error>>
{
    public async Task<Result<List<DateOnly>, Error>> Handle(
        GetAvailableDatesQuery request,
        CancellationToken cancellationToken)
    {
        var dates = await slotService.GetAvailableDatesAsync(
            request.ServiceId,
            request.MasterId,
            request.Year,
            request.Month,
            cancellationToken);

        return Result.Success<List<DateOnly>, Error>(dates);
    }
}
