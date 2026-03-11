namespace Application.Common.Interfaces;

public interface INotificationClient
{
    Task ReceiveAppointmentUpdate(string title, string message, object? data);
}
