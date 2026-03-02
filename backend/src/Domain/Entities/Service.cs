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

    public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();

    public virtual Category Category { get; private set; } = null!;

    public virtual ICollection<Master> Masters { get; private set; } = new List<Master>();

    private Service() { }

    public Service (Guid categoryId, string title, string? description, int duration, decimal price)
    {
        CategoryId = categoryId;
        Title = title;
        Description = description;
        Duration = duration;
        Price = price;
    }
}
