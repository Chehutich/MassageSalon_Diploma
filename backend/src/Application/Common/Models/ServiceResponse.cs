namespace Application.Common.Models;

public record ServiceResponse(
    Guid Id,
    string Title,
    string? Description,
    int Duration,
    decimal Price,
    string? Badge,
    string CategorySlug);
