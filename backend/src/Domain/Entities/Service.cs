using Domain.Enums;

namespace Domain.Entities;

public class Service
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid CategoryId { get; private set; }

    public string Title { get; private set; } = null!;

    public string? Description { get; private set; }

    public int Duration { get; private set; }

    public decimal Price { get; private set; }

    public bool IsActive { get; private set; } = true;

    public ServiceBadge? Badge { get; private set;}

    public List<string> Benefits { get; private set; } = new();

    public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();

    public virtual Category Category { get; private set; } = null!;

    public virtual ICollection<Master> Masters { get; private set; } = new List<Master>();

    private Service() { }

    public Service (Guid categoryId, string title, string? description, int duration, decimal price, List<string>? benefits = null)
    {
        CategoryId = categoryId;
        Title = title;
        Description = description;
        Duration = duration;
        Price = price;

        Benefits = benefits ?? new List<string>();
    }

    public void AddBenefit(string benefit)
    {
        if (!string.IsNullOrWhiteSpace(benefit) && !Benefits.Contains(benefit))
        {
            Benefits.Add(benefit);
        }
    }

    public void SetBadge(ServiceBadge badge)
    {
        Badge = badge;
    }
}
