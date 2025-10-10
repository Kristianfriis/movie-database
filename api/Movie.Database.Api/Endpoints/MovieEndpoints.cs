using System;
using System.Security.Claims;
using Movie.Database.Api.Dtos;
using Movie.Database.Api.Extentions;
using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.Endpoints;

public static class MovieEndpoints
{
    public static void MapMovieEndpoints(this WebApplication app)
    {
        var movies = app.MapGroup("/movies")
            .WithTags("Movies")
            .RequireAuthorization();

        var collections = app.MapGroup("/collections")
            .WithTags("Collections")
            .RequireAuthorization();

        movies.MapGet("/{id:guid}", async (Guid id, IMovieRepository repo) =>
        {
            var movie = await repo.GetByIdAsync(id);
            return movie is null ? Results.NotFound() : Results.Ok(movie);
        });

        collections.MapGet("/{userId:guid}", async (Guid userId, IMovieRepository repo) =>
        {
            var collections = await repo.GetAvailableCollectionsAsync(userId);

            return Results.Ok(collections);
        });

        collections.MapGet("/{collectionId:guid}/movies", async (Guid collectionId, IMovieRepository repo) =>
        {
            var movies = await repo.GetByCollectionAsync(collectionId);

            return Results.Ok(movies);
        });

        collections.MapPost("/{collectionId:guid}/movies", async (Guid collectionId, MovieModel movie, IMovieRepository repo) =>
        {
            await repo.AddToCollectionAsync(collectionId, movie);

            return Results.Created($"/movies/{movie.Id}", movie);
        });

        collections.MapDelete("/{collectionId:guid}/movies/{movieId:guid}", async (Guid collectionId, Guid movieId, IMovieRepository repo) =>
        {
            await repo.RemoveFromCollectionAsync(collectionId, movieId);

            return Results.NoContent();
        });

        collections.MapPost("/", async (CreateCollectionRequest request, IMovieRepository repo) =>
        {
            var id = await repo.CreateCollectionAsync(request.Name, request.OwnerId);
            
            return Results.Created($"/collections/{id}", new { id });
        });
    }
}