using System.Runtime.InteropServices.JavaScript;
using Application.Common.Interfaces;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.Catalog.GetAvailableSlots;

public record GetAvailableSlotsQuery(Guid? MasterId, Guid ServiceId, DateTime Date)
    : IRequest<Result<List<SlotResponse>, Error>>;

public class GetAvailableSlotsQueryHandler(ISlotService slotService)
    : IRequestHandler<GetAvailableSlotsQuery, Result<List<SlotResponse>, Error>>
{
    public async Task<Result<List<SlotResponse>, Error>> Handle(
        GetAvailableSlotsQuery request,
        CancellationToken cancellationToken)
    {
        var slots = await slotService.GetAvailableSlotsAsync(request.MasterId, request.ServiceId, request.Date,
            cancellationToken);

        return slots;
    }
}
