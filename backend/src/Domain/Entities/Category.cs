using System.Text.RegularExpressions;
using Domain.Common;

namespace Domain.Entities;

public class Category
{
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

        result = RegexHelper.NonAlphanumericRegex().Replace(result, "");

        result = RegexHelper.MultipleHyphensRegex().Replace(result, "-");

        return result.Trim('-');
    }
}
