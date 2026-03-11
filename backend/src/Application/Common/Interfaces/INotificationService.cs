namespace Application.Common.Interfaces;

public interface INotificationService
{
    Task NotifyUserAsync(Guid userId, string title, string message, object? data = null);
}
