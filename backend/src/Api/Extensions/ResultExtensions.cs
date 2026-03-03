using CSharpFunctionalExtensions;
using Domain.Errors;

namespace Api.Extensions;

using IResult = Microsoft.AspNetCore.Http.IResult;

public static class ResultExtensions
{
    public static IResult ToProblemDetails<T>(this Result<T, Error> result)
    {
        if (result.IsSuccess)
        {
            throw new InvalidOperationException("Can't create ProblemDetails for a successful result.");
        }

        if (result.Error is ValidationError validationError)
        {
            return Results.ValidationProblem(
                validationError.Errors,
                title: "Validation Error",
                detail: validationError.Description,
                statusCode: StatusCodes.Status400BadRequest);
        }

        var statusCode = result.Error.Code switch
        {
            var c when c.Contains("NotFound", StringComparison.Ordinal) => StatusCodes.Status404NotFound,
            var c when c.StartsWith("Duplicate", StringComparison.Ordinal) => StatusCodes.Status409Conflict,
            var c when c.StartsWith("Conflict", StringComparison.Ordinal) => StatusCodes.Status409Conflict,
            var c when c.StartsWith("Auth.Invalid", StringComparison.Ordinal) => StatusCodes.Status401Unauthorized,
            var c when c.StartsWith("Auth.", StringComparison.Ordinal) => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status400BadRequest,
        };

        var title = result.Error.Code switch
        {
            var c when c.StartsWith("Duplicate", StringComparison.Ordinal) => "Conflict",
            var c when c.StartsWith("Conflict", StringComparison.Ordinal) => "Conflict",
            var c when c.StartsWith("InvalidCredentials",  StringComparison.Ordinal) => "Authentication Failed",
            var c when c.Contains("NotFound",  StringComparison.Ordinal) => "Not Found",
            var c when c.StartsWith("Auth.",  StringComparison.Ordinal) => "Authorization Error",
            _ => "Bad Request",
        };

        var errors = new Dictionary<string, string[]>();

        var fieldName = result.Error.Code switch
        {
            var c when c.Contains("Email") => "Email",
            var c when c.Contains("Phone") => "Phone",
            var c when c.Contains("Password") => "Password",
            var c when c.StartsWith("Appointment", StringComparison.Ordinal) => "TimeSlot",
            var c when c.StartsWith("Service", StringComparison.Ordinal) => "Service",
            _ => "General",
        };

        errors.Add(fieldName, [result.Error.Code]);

        return Results.ValidationProblem(
            errors,
            title: title,
            detail: result.Error.Description,
            statusCode: statusCode);
    }
}
