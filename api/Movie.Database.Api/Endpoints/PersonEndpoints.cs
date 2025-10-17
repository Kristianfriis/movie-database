using System;
using Movie.Database.Api.Interfaces;

namespace Movie.Database.Api.Endpoints;

public static class PersonEndpoints
{
    public static void MapPersonEndpoints(this WebApplication app)
    {
        var people = app.MapGroup("/people")
            .WithTags("People")
            .RequireAuthorization();

        people.MapGet("/{id:guid}", async (Guid id) =>
        {
            return Results.Ok(new { id });
        });

        people.MapGet("/search/{query}", async (string query, IPersonRepository repo) =>
        {
            var people = await repo.SearchPeopleAsync(query);

            return Results.Ok(people);
        });
    }
}
