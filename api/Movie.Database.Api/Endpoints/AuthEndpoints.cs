using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Movie.Database.Api.Dtos;
using Movie.Database.Api.Extentions;
using Movie.Database.Api.Models;
using Movie.Database.Api.Persistence;

namespace Movie.Database.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var authGroup = app.MapGroup("/user").WithTags("Auth");

        authGroup.MapGet("/", async (ClaimsPrincipal principal, UserRepository repo) =>
        {
            var metaData = principal.GetUserId();

            if (metaData is null)
                return Results.Unauthorized();

            var user = await repo.GetUserByAuthId(metaData.sub);

            if (user is null)
                return Results.Ok(new { exists = false });

            return Results.Ok(user);
        })
        .RequireAuthorization();

        authGroup.MapPost("/", async (ClaimsPrincipal principal, [FromServices] UserRepository repo, [FromBody] UserDto user) =>
        {
            var metaData = principal.GetUserId();

            if (metaData is null)
                return Results.Unauthorized();

            var existingUser = await repo.GetUserByAuthId(metaData.sub);
            if (existingUser is not null)
                return Results.Conflict("User already exists");

            var newUser = await repo.CreateUserAsync(metaData.sub, metaData.email, user.Name);

            return Results.Ok(newUser);
        }).RequireAuthorization();

        authGroup.MapPut("/", async (ClaimsPrincipal principal, [FromServices] UserRepository repo, [FromBody] UserDto user) =>
        {
            var metaData = principal.GetUserId();

            if (metaData is null)
                return Results.Unauthorized();

            var existingUser = await repo.GetUserByAuthId(metaData.sub);
            if (existingUser is null)
                return Results.NotFound("User not found");

            var userToUpdate = new User
            {
                Id = existingUser.Id,
                Email = existingUser.Email,
                Name = user.Name,
                CreatedAt = existingUser.CreatedAt
            };

            var updatedUser = await repo.UpdateUserAsync(userToUpdate);

            if (updatedUser is null)
                return Results.BadRequest("Unable to update user");

            return Results.Ok(updatedUser);
        }).RequireAuthorization();
    }
}
