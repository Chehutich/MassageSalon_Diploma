namespace Domain.Errors;

public static class Errors
{
    public static class Service
    {
        public static Error NotFound(Guid id)
        {
            return new Error(
                "Service.NotFound",
                $"Service with ID {id} was not found.");
        }
    }

    public static class User
    {
        public static Error InvalidCredentials => new(
            "User.InvalidCredentials",
            "User credentials are invalid.");

        public static Error InvalidPassword => new(
            "User.InvalidPassword",
            "Password is invalid.");

        public static Error NotFound(Guid id)
        {
            return new Error(
                "User.NotFound",
                $"User with ID {id} was not found.");
        }

        public static Error DuplicateEmail(string email)
        {
            return new Error(
                "User.DuplicateEmail",
                $"User with email {email} already exists.");
        }

        public static Error DuplicatePhone(string phone)
        {
            return new Error(
                "User.DuplicatePhone",
                $"User with phone {phone} already exists.");
        }

        public static Error InvalidRefreshToken => new(
            "Auth.InvalidRefreshToken",
            "Session has expired. Please login again.");

        public static Error InvalidAccessToken => new(
            "Auth.InvalidAccessToken",
            "Invalid token.");
    }

    public static class Appointment
    {
        public static Error Conflict => new(
            "Appointment.Conflict",
            "Appointment time conflicts with another appointment.");

        public static readonly Error TooLateToReschedule = new(
            "Appointment.TooLateToReschedule",
            "Appointments can only be rescheduled at least 24 hours in advance.");

        public static readonly Error TooLateToCancel = new(
            "Appointment.TooLateToCancel",
            "Appointments can only be canceled at least 1 hour in advance.");

        public static Error NotFound(Guid id)
        {
            return new Error(
                "Appointment.NotFound",
                $"Appointment with ID {id} was not found.");
        }
    }

    public static class Master
    {
        public static Error NotFound(Guid id)
        {
            return new Error(
                "Master.NotFound",
                $"Master with ID {id} was not found.");
        }
    }
}
