namespace Application.Common.Constants;

public static class ValidationErrors
{
    public static class User
    {
        public const string EmailRequired = "User.Email.Required";
        public const string EmailInvalidFormat = "User.Email.InvalidFormat";
        public const string PasswordRequired = "User.Password.Required";
        public const string PasswordMinLength = "User.Password.MinLength";

        public const string NewPasswordRequired = "User.NewPassword.Required";
        public const string NewPasswordMinLength = "User.NewPassword.PasswordMinLength";
        public const string OldPasswordRequired = "User.OldPassword.Required";
        public const string OldPasswordMinLength = "User.OldPasswordMinLength.PasswordMinLength";
        public const string NotEqualNewPassword = "User.OldPasswordNot.EqualNewPassword";

        public const string PhoneRequired = "User.Phone.Required";
        public const string PhoneInvalidFormat = "User.Phone.InvalidFormat";

        public const string FirstNameRequired = "User.FirstName.Required";
        public const string FirstNameMaxLength = "User.FirstName.MaxLength";
        public const string LastNameRequired = "User.LastName.Required";
        public const string LastNameMaxLength = "User.LastName.MaxLength";
    }

    public static class Service
    {
        public const string IdRequired = "Service.Id.Required";
    }

    public static class Master
    {
        public const string IdRequired = "Master.Id.Required";
    }

    public static class Appointment
    {
        public const string IdRequired = "Appointment.Id.Required";
        public const string InvalidTime = "Appointment.StartTime.Invalid";

        public const string StartTimeRequired = "Appointment.StartTime.Required";
        public const string StartTimeInvalid = "Appointment.StartTime.Invalid";
        public const string EndTimeRequired = "Appointment.EndTime.Required";

        public const string NewStartTimeRequired = "Appointment.NewStartTime.Required";
        public const string NewStartTimeInvalid = "Appointment.NewStartTime.Invalid";
    }

    public static class GetAvailableDates
    {
        public const string ServiceIdRequired = "GetAvailableDates.ServiceId.Required";
        public const string YearRequired = "GetAvailableDates.Date.Required";
        public const string MonthRequired = "GetAvailableDates.Date.Required";
        public const string MasterIdNotEmpty = "GetAvailableDates.MasterId.NotEmpty";

    }

    public static class Token
    {
        public const string InvalidToken = "Token.InvalidAccessToken";
        public const string AccessTokenRequired = "Token.AccessToken.Required";
        public const string RefreshTokenRequired = "Token.RefreshToken.Required";
    }
}
