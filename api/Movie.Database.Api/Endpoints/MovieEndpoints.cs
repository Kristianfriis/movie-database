using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Movie.Database.Api.Dtos;
using Movie.Database.Api.Extentions;
using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;
using Movie.Database.Api.Persistence;

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
        }).Produces<MovieModel>(StatusCodes.Status200OK);

        collections.MapGet("/{userId:guid}", async (Guid userId, IMovieRepository repo) =>
        {
            var collections = await repo.GetAvailableCollectionsAsync(userId);

            return Results.Ok(collections);
        }).Produces<List<AvailableCollection>>();;

        collections.MapGet("/{collectionId:guid}/movies", async (Guid collectionId, IMovieRepository repo) =>
        {
            var movies = await repo.GetByCollectionAsync(collectionId);

            return Results.Ok(movies);
        }).Produces<List<MovieModel>>();;

        collections.MapPost("/{collectionId:guid}/movies", async (Guid collectionId, CreateMovieRequest movie, IMovieRepository repo) =>
        {
            var movieModel = new MovieModel
            {
                Title = movie.Title,
                Format = (MovieFormat)movie.Format
            };

            var id = await repo.AddToCollectionAsync(collectionId, movieModel);

            movieModel.Id = id;

            return Results.Created($"/movies/{movieModel.Id}", movieModel);
        }).Produces<MovieModel>(StatusCodes.Status201Created);

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

        collections.MapPost("/{collectionId:guid}/invite", async (Guid collectionId, ClaimsPrincipal user, IConfiguration config, ICollectionService collectionService, IUserRepository userRepo) =>
        {
            var metaData = user.GetUserId();

            if (metaData is null)
                return Results.Unauthorized();

            var existingUser = await userRepo.GetUserByAuthId(metaData.sub);
            if (existingUser is null)
                return Results.NotFound("User not found");


            var (key, error) = await collectionService.GenerateInviteAsync(collectionId, Guid.Parse(existingUser.Id));

            if (error is not null)
                return Results.BadRequest(error);
            
            return Results.Ok(new { key });
        }).Produces<string>();

        collections.MapPost("/join", async ([FromBody] JoinCollectionRequest request, [FromServices] IConfiguration config, [FromServices] ICollectionService collectionService, ClaimsPrincipal user, [FromServices] IUserRepository userRepo) =>
        {
            var metaData = user.GetUserId();

            if (metaData is null)
                return Results.Unauthorized();

            var existingUser = await userRepo.GetUserByAuthId(metaData.sub);
            if (existingUser is null)
                return Results.NotFound("User not found");

            var mappedRole = (CollectionRole)request.Role;

            var (success, error) = await collectionService.JoinCollectionAsync(request.CollectionId, Guid.Parse(existingUser.Id), request.UserIdToAdd, mappedRole);

            if (!success)
                return Results.BadRequest(error);

            return Results.Ok();
        });
        
        collections.MapGet("/collectionInfo/{collectionId:guid}", async (Guid collectionId, ICollectionService collectionService, ClaimsPrincipal user, IUserRepository userRepo)  =>
        {
             var metaData = user.GetUserId();

            if (metaData is null)
                return Results.Unauthorized();

            var existingUser = await userRepo.GetUserByAuthId(metaData.sub);
            if (existingUser is null)
                return Results.NotFound("User not found");

            var result = await collectionService.GetCollectionInfoAsync(collectionId, Guid.Parse(existingUser.Id));

            if (result.error is not null)
                return Results.BadRequest(result.error);

            var collection = result.availableCollection;

            if (collection is null)
                return Results.NotFound("Collection not found");

            var mappedResponse = new CollectionInfoDto
            {
                Id = collection.Id,
                Name = collection?.Name,
                CreatedAt = collection!.CreatedAt,
                RoleForCurrentUser = Enum.Parse<CollectionRoleDto>(collection.Role.ToString().ToLower(), true)
            };

            return Results.Ok(mappedResponse);
        }).Produces<CollectionInfoDto>();
    
    }
}