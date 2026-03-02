using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InfrastructureTests.Repos;

public abstract class BaseRepositoryTest : IDisposable
{
    protected readonly ApplicationDbContext context;

    protected BaseRepositoryTest()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        context = new ApplicationDbContext(options);

        context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        context.Database.EnsureDeleted();
        context.Dispose();
        GC.SuppressFinalize(this);
    }
}
