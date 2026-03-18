namespace Application.Common.Interfaces.Repos;

public interface ITimeOffsRepository
{
    Task<bool> IsMasterOnTimeOffAsync(Guid masterId, DateTime date, CancellationToken cancellationToken = default);
}
