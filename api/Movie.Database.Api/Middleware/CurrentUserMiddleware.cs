using System;
using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.Middleware;

public class CurrentUserMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly string[] _skipPaths = ["/health", "/healthz"];

    public CurrentUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IUserRepository userRepo)
    {
        var principal = context.User;
        var path = context.Request.Path.Value;

        // Skip user lookup for health endpoints
        if (_skipPaths.Any(p => path!.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
        {
            await _next(context);
            return;
        }


        if (principal?.Identity?.IsAuthenticated == true)
        {
            var sub = principal.FindFirst("sub")?.Value;

            if (!string.IsNullOrEmpty(sub))
            {
                var dbUser = await userRepo.GetUserByAuthId(sub);

                if (dbUser != null)
                {
                    var currentUser = new CurrentUser
                    {
                        Id = Guid.Parse(dbUser.Id),
                        Email = dbUser.Email,
                        Name = dbUser.Name
                    };

                    // Store in HttpContext.Items for now
                    context.Items[nameof(ICurrentUser)] = currentUser;
                }
            }
        }

        await _next(context);
    }
}
