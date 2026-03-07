namespace Application.Common.Models;

public record ServiceDetailsResponse(
    Guid Id,
    string Title,
    string? Description,
    int Duration,
    decimal Price,
    string CategorySlug,
    string? Badge,
    List<string> Benefits,
    List<MasterShortResponse> Masters);

