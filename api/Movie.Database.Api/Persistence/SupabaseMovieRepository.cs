using System;
using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;
using Movie.Database.Api.Persistence.Entities;
using Supabase.Postgrest;

namespace Movie.Database.Api.Persistence;

public class SupabaseMovieRepository : IMovieRepository
{
    private readonly Supabase.Client _client;

    public SupabaseMovieRepository(Supabase.Client client)
    {
        _client = client;
    }

    public async Task<MovieModel?> GetByIdAsync(Guid id)
    {
        var result = await _client
            .From<MovieEntity>()
            .Where(m => m.Id == id)
            .Single();

        return result == null ? null : MapToDomain(result);
    }

    public async Task<List<MovieModel>> GetByCollectionAsync(Guid collectionId)
    {
        var links = await _client
            .From<CollectionMovieEntity>()
            .Where(l => l.CollectionId == collectionId)
            .Get();

        var movieIds = links.Models.Select(l => l.MovieId).ToList();

        if (!movieIds.Any()) return new List<MovieModel>();

        var movies = await _client
            .From<MovieEntity>()
            .Filter("id", Constants.Operator.In, movieIds)
            .Get();

        return movies.Models.Select(MapToDomain).ToList();
    }

    public async Task AddToCollectionAsync(Guid collectionId, MovieModel movie)
    {
        var dbMovie = new MovieEntity
        {
            Id = movie.Id,
            Title = movie.Title,
        };

        var inserted = await _client.From<MovieEntity>().Insert(dbMovie);
        if (inserted.Model is null)
        {
            throw new Exception("Failed to insert movie");
        }

        var link = new CollectionMovieEntity
        {
            CollectionId = collectionId,
            MovieId = inserted.Model.Id,
        };

        await _client.From<CollectionMovieEntity>().Insert(link);
    }

    public async Task RemoveFromCollectionAsync(Guid collectionId, Guid movieId)
    {
        await _client
            .From<CollectionMovieEntity>()
            .Filter("collection_id", Constants.Operator.Equals, collectionId)
            .Filter("movie_id", Constants.Operator.Equals, movieId)
            .Delete();
    }

    public async Task<List<AvailableCollection>> GetAvailableCollectionsAsync(Guid userId)
    {
        var roles = await _client
            .From<UserCollectionRoleEntity>()
            .Filter("user_id", Constants.Operator.Equals, userId.ToString())
            .Get();

        var collectionIds = roles.Models.Select(r => r.CollectionId).Distinct().ToList();
        if (!collectionIds.Any()) return new List<AvailableCollection>();

        var collectionIdsAsStrings = collectionIds.Select(id => id.ToString()).ToList();

        var collections = await _client
            .From<CollectionEntity>()
            .Filter("id", Constants.Operator.In, collectionIdsAsStrings)
            .Get();

        var allRoles = await _client
            .From<UserCollectionRoleEntity>()
            .Filter("collection_id", Constants.Operator.In, collectionIdsAsStrings)
            .Get();

        var userIdsAsStrings = allRoles.Models.Select(r => r.UserId.ToString()).Distinct().ToList();

        var allUsers = await _client
            .From<UserEntity>()
            .Filter("id", Constants.Operator.In, allRoles.Models.Select(r => r.UserId).Distinct().ToList())
            .Get();

        var result = new List<AvailableCollection>();

        var index = 0;

        return collections.Models.Select(c =>
        {
            var userRole = roles.Models.First(r => r.CollectionId == c.Id).Role;

            var members = allRoles.Models
                .Where(r => r.CollectionId == c.Id)
                .Select(r => new CollectionMember
                {
                    UserId = r.UserId,
                    Name = allUsers.Models.FirstOrDefault(u => Guid.Parse(u.Id) == r.UserId)?.Name ?? "Unknown",
                    Role = Enum.Parse<CollectionRole>(r.Role ?? "reader", true)
                }).ToList();

            var coll = new AvailableCollection
            {
                IndexId = index, // Assign and increment the index
                Id = c.Id,
                Name = c.Name,
                CreatedAt = c.CreatedAt,
                Role = Enum.Parse<CollectionRole>(userRole ?? "reader", true),
                Members = members
            };

            index++;

            return coll;
        }).ToList();
    }



    private MovieModel MapToDomain(MovieEntity db)
    {
        return new MovieModel
        {
            Id = db.Id,
            Title = db.Title,
            CreatedAt = db.CreatedAt
        };
    }

    public async Task<Guid> CreateCollectionAsync(string name, Guid ownerId)
    {
        var newCollection = new CollectionEntity
        {
            Id = Guid.NewGuid(),
            Name = name,
            CreatedAt = DateTime.UtcNow,
        };

        var inserted = await _client.From<CollectionEntity>().Insert(newCollection);

        if (inserted.Model is null)
        {
            throw new Exception("Failed to create collection");
        }

        var role = new UserCollectionRoleEntity
        {
            UserId = ownerId,
            CollectionId = inserted.Model.Id,
            Role = CollectionRole.Maintainer.ToString().ToLower(),
        };

        await _client.From<UserCollectionRoleEntity>().Insert(role);

        return newCollection.Id;
    }

    public Task AddMemberAsync(Guid collectionId, Guid userId, CollectionRole role)
    {
        throw new NotImplementedException();
    }

    public Task UpdateMemberRoleAsync(Guid collectionId, Guid userId, CollectionRole role)
    {
        throw new NotImplementedException();
    }

    public Task RemoveMemberAsync(Guid collectionId, Guid userId)
    {
        throw new NotImplementedException();
    }
}
