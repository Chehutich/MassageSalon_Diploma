using Application.Common.Interfaces;
using CSharpFunctionalExtensions;
using Domain.ValueObjects;
using MediatR;

namespace Application.Features.Queries.GetAvailableSlots;

public record GetAvailableSlotsQuery(Guid MasterId, Guid ServiceId, DateTime Date) : IRequest<Result<List<Slot>>>;

public class GetAvailableSlotsQueryHandler(ISlotService slotService) : IRequestHandler<GetAvailableSlotsQuery, Result<List<Slot>>>
{
    public async Task<Result<List<Slot>>> Handle(GetAvailableSlotsQuery request, CancellationToken cancellationToken)
    {
        var slots = await slotService.GetAvailableSlotsAsync(request.MasterId, request.ServiceId, request.Date,
            cancellationToken);

        return slots;
    }
}
