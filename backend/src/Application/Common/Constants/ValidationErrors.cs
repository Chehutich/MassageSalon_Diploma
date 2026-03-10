namespace Application.Common.Constants;

public static class ValidationErrors
{
    public static class User
    {
        public const string PasswordMinLength = "User.Password.MinLength";
        public const string InvalidNameFormat = "User.InvalidNameFormat";
        public const string InvalidEmailFormat = "User.InvalidEmailFormat";
        public const string InvalidPhoneFormat = "User.InvalidPhoneFormat";
        public const string NameMaxLength = "User.NameMaxLength";
        public const string CurrentPasswordRequired = "User.CurrentPasswordRequired";
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

    public static class File
    {
        public const string Empty = "FIle.Empty";
        public const string InvalidFileType = "File.InvalidFileType";
        public const string TooBig = "File.TooBig";
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
