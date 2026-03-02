using Domain.Entities;

namespace Application.Common.Intefaces.Repos;

public interface IUserRepository
{
    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    public Task<User?> GetByPhoneAsync(string phone, CancellationToken cancellationToken = default);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    public Task AddAsync(User user, CancellationToken cancellationToken = default);
}
