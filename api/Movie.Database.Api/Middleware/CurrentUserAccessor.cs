using System;
using Movie.Database.Api.Interfaces;

namespace Movie.Database.Api.Middleware;

public class CurrentUserAccessor : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserAccessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ICurrentUser? CurrentUser =>
        _httpContextAccessor.HttpContext?.Items[nameof(ICurrentUser)] as ICurrentUser;

    public Guid Id => CurrentUser?.Id ?? Guid.Empty;
    public string? Email => CurrentUser?.Email;
    public string? Name => CurrentUser?.Name;
}