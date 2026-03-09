using Application.Common.Interfaces;
using Application.Common.Interfaces.Repos;
using Application.Common.Models;
using CSharpFunctionalExtensions;
using Domain.Errors;
using MediatR;

namespace Application.Features.User.GetMe;

public record GetMeQuery : IRequest<Result<UserMeResponse, Error>>;

public class GetMeHandler(
    IUserRepository userRepository,
    ICurrentUserContext userContext) : IRequestHandler<GetMeQuery, Result<UserMeResponse, Error>>
{
    public async Task<Result<UserMeResponse, Error>> Handle(GetMeQuery request, CancellationToken cancellationToken)
    {
        var userId = userContext.Id;
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
        {
            return Errors.User.NotFound(userId);
        }

        return new UserMeResponse(user.Id, user.FirstName, user.LastName, user.Email, user.PhotoUrl, user.Phone, user.Role.ToString());
    }
}
