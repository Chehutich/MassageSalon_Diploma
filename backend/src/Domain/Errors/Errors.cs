namespace Domain.Errors;

public static class Errors
{
    public static class User
    {
        public static Error InvalidCredentials => new(
            "User.InvalidCredentials",
            "User credentials are invalid.");

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

        public static Error InvalidRefreshToken => new Error(
            "Auth.InvalidRefreshToken",
            "Session has expired. Please login again.");

        public static Error InvalidToken => new Error(
            "Auth.InvalidToken",
            "Invalid token.");
    }
}
