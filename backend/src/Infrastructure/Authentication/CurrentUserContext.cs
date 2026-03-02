using System.Security.Claims;
using Application.Common.Intefaces;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Authentication;

public class CurrentUserContext(IHttpContextAccessor httpContextAccessor) : ICurrentUserContext
{
    public Guid Id
    {
        get
        {
            var userIdClaim = httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }

            throw new UnauthorizedAccessException("User context is unavailable.");
        }
    }
}
