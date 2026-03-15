namespace Domain.Common;

public static class SlugHelper
{
    public static string PrepareSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return string.Empty;
        }

        var result = slug.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("_", "-");

        result = RegexHelper.NonAlphanumericRegex().Replace(result, "");

        result = RegexHelper.MultipleHyphensRegex().Replace(result, "-");

        return result.Trim('-');
    }
}
