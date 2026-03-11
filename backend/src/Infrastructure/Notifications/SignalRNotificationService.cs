using Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.Notifications;

public class SignalRNotificationService(
    IHubContext<NotificationHub,
        INotificationClient> hubContext) : INotificationService
{
    public async Task NotifyUserAsync(Guid userId, string title, string message, object? data = null)
    {
        await hubContext.Clients.Group(userId.ToString())
            .ReceiveAppointmentUpdate(title, message, data ?? new { });
    }
}
