using Application.Common.Interfaces;
using Application.Features.Appointments.GetAppointmentDetails;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Application.Events;

public record AppointmentCreatedEvent(Guid AppointmentId) : INotification;

public class AppointmentNotificationHandler(
    INotificationService notificationService,
    ISender sender) : INotificationHandler<AppointmentCreatedEvent>
{
    public async Task Handle(AppointmentCreatedEvent notification, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAppointmentDetailsQuery(notification.AppointmentId), cancellationToken);

        if (result.IsSuccess)
        {
            var app = result.Value;

            string title = "New Appointment";
            string message = $"{app.ClientFirstName} {app.ClientLastName} — {app.ServiceName} at {app.StartTime:HH:mm}";

            await notificationService.NotifyUserAsync(
                app.MasterUserId,
                title,
                message,
                new
                {
                    id = app.Id,
                    startTime = app.StartTime,
                    clientName = $"{app.ClientFirstName} {app.ClientLastName}",
                    serviceName = app.ServiceName
                }
            );
        }
    }
}
