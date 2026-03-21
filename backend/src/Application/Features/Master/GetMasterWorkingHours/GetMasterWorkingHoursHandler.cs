using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Enums;
using MediatR;

namespace Application.Features.Master.GetMasterWorkingHours;

public record GetMasterWorkingHoursQuery(
    int? Month = null,
    int? Year = null) : IRequest<Result<List<MasterWorkingHoursResponse>>>;

public class GetMasterWorkingHoursHandler(
    IMasterRepository masterRepository,
    IScheduleRepository scheduleRepository,
    ITimeOffRepository timeOffRepository,
    ICurrentUserContext userContext,
    TimeProvider timeProvider)
    : IRequestHandler<GetMasterWorkingHoursQuery, Result<List<MasterWorkingHoursResponse>>>
{
    public async Task<Result<List<MasterWorkingHoursResponse>>> Handle(GetMasterWorkingHoursQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = userContext.Id;

        var master = await masterRepository.GetByUserIdAsync(currentUserId, cancellationToken);

        if (master == null)
        {
            return Result.Success(new List<MasterWorkingHoursResponse>());
        }

        var now = timeProvider.GetUtcNow().DateTime;
        int year = request.Year ?? now.Year;
        int month = request.Month ?? now.Month;

        var firstDayOfMonth = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

        var weeklySchedules = await scheduleRepository.GetByMasterIdAsync(master.Id, cancellationToken);

        var timeOffs = await timeOffRepository.GetByMasterIdAsync(master.Id, firstDayOfMonth, lastDayOfMonth, cancellationToken);

        var response = new List<MasterWorkingHoursResponse>(32);

        for (var date = firstDayOfMonth; date <= lastDayOfMonth; date = date.AddDays(1))
        {
            int dayOfWeek = (int)date.DayOfWeek;

            var template = weeklySchedules.FirstOrDefault(s => s.DayOfWeek == dayOfWeek);

            var isTimeOff = timeOffs.Any(to =>
                DateOnly.FromDateTime(date) >= to.StartDate &&
                DateOnly.FromDateTime(date) <= to.EndDate);

            if (template == null || isTimeOff)
            {
                response.Add(new MasterWorkingHoursResponse(
                    date,
                    null,
                    null,
                    false,
                    isTimeOff ? nameof(WorkingDayType.TimeOff) : nameof(WorkingDayType.RegularOff)));
                continue;
            }

            var startUtc = DateTime.SpecifyKind(date.Date.Add(template.StartTime.ToTimeSpan()), DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(date.Date.Add(template.EndTime.ToTimeSpan()), DateTimeKind.Utc);

            response.Add(new MasterWorkingHoursResponse(
                date,
                startUtc,
                endUtc,
                true,
                nameof(WorkingDayType.Regular)));
        }

        return Result.Success(response);
    }
}
