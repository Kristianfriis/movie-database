using System;
using Microsoft.AspNetCore.Mvc;
using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;

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

        people.MapPost("/", async ([FromBody] Person person, [FromServices] IPersonRepository repo) =>
        {
            var result = await repo.CreatePerson(person);

            return Results.Ok(result);
        }).Produces<Person>();

        people.MapPut("/", async ([FromBody] Person person, [FromServices] IPersonRepository repo) =>
        {
            var result = await repo.UpdatePerson(person);

            return Results.Ok(result);
        }).Produces<Person>();
    }
}
