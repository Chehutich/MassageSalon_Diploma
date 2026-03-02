namespace Domain.Entities;

public class Category
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string Title { get; private set; } = null!;

    public bool IsActive { get; private set; } = true;

    public virtual ICollection<Service> Services { get; private set; } = new List<Service>();

    private Category() { }

    public Category(string title)
    {
        Title = title;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
