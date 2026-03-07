using System.Text.RegularExpressions;

namespace Domain.Entities;

public partial class Category
{
    [GeneratedRegex(@"[^a-z0-9\-]+")]
    private static partial Regex NonAlphanumericRegex();

    [GeneratedRegex(@"\-+")]
    private static partial Regex MultipleHyphensRegex();

    public Guid Id { get; private set; } = Guid.NewGuid();

    public string Title { get; private set; } = null!;

    public string Slug { get; private set; } = null!;

    public bool IsActive { get; private set; } = true;

    public virtual ICollection<Service> Services { get; private set; } = new List<Service>();

    private Category() { }

    public Category(string title, string slug)
    {
        Title = title;
        Slug = PrepareSlug(slug);
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    private string PrepareSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return string.Empty;
        }

        var result = slug.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("_", "-");

        result = NonAlphanumericRegex().Replace(result, "");

        result = MultipleHyphensRegex().Replace(result, "-");

        return result.Trim('-');
    }
}
