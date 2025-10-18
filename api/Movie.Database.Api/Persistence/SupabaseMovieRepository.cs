using System;
using System.Text.Json;
using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;
using Movie.Database.Api.Persistence.Entities;
using Movie.Database.Api.Persistence.Mappers;
using Supabase.Postgrest;

namespace Movie.Database.Api.Persistence;

public class SupabaseMovieRepository : IMovieRepository
{
    private readonly Supabase.Client _client;
    private const string Director = "director";
    private const string Cast = "cast";


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

        if (result is null) 
            return null;

        var moviePersonsEntities = await _client
            .From<MoviePersonEntity>()
            .Where(m => m.MovieId == id)
            .Get();

        var directors = moviePersonsEntities.Models.Where(m => m.Type == Director).ToList();
        var cast = moviePersonsEntities.Models.Where(m => m.Type == Cast).ToList();

        var directorsEntities = await _client
            .From<PersonEntity>()
            .Filter("id", Constants.Operator.In, directors.Select(m => m.PersonId).ToList())
            .Get();

        var castEntities = await _client
            .From<PersonEntity>()
            .Filter("id", Constants.Operator.In, cast.Select(m => m.PersonId).ToList())
            .Get();
        
        var movie = MapToDomain(result);

        movie.Directors.AddRange(directorsEntities.Models.Select(PersonMapper.MapToDomain).ToList());
        movie.Cast.AddRange(castEntities.Models.Select(PersonMapper.MapToDomain).ToList());

        return movie;
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

    public async Task<Guid> AddToCollectionAsync(Guid collectionId, MovieModel movie)
    {
        var dbMovie = new MovieEntity
        {
            Id = movie.Id,
            Title = movie.Title,
            Format = movie.Format.ToString().ToLower(),
            Genres = JsonSerializer.Serialize(movie.Genre),
            PosterUrl = movie.PosterUrl,
            Overview = movie.Overview,
            CreatedAt = DateTime.UtcNow,
        };

        var inserted = await _client.From<MovieEntity>().Insert(dbMovie);
        if (inserted.Model is null)
        {
            throw new Exception("Failed to insert movie");
        }


        var directorIds = await InsertPersonAsync(movie.Directors);
        var castIds = await InsertPersonAsync(movie.Cast);

        await LinkPersonsAndMovieAsync(directorIds, inserted.Model.Id, Director);
        await LinkPersonsAndMovieAsync(castIds, inserted.Model.Id, Cast);

        var link = new CollectionMovieEntity
        {
            CollectionId = collectionId,
            MovieId = inserted.Model.Id,
        };

        await _client.From<CollectionMovieEntity>().Insert(link);

        return inserted.Model.Id;
    }

    private async Task LinkPersonsAndMovieAsync(List<long> personIds, Guid id, string v)
    {
        var links = new List<MoviePersonEntity>();

        personIds.ForEach(d =>
        {
            var link = new MoviePersonEntity
            {
                MovieId = id,
                PersonId = d,
                CreatedAt = DateTime.UtcNow,
                Type = v
            };

            links.Add(link);
        });

        await _client.From<MoviePersonEntity>().Insert(links);
    }

    public async Task<List<long>> InsertPersonAsync(List<Person> people)
    {
        var result = new List<long>();

        if (!people.Any()) return result;

        var externalIds = people.Select(p => p.ExternalId).ToList();

        var existing = await _client
            .From<PersonEntity>()
            .Filter("external_id", Constants.Operator.In, externalIds)
            .Get();

        result.AddRange(existing.Models.Select(p => p.Id).ToList());

        var newPeople = people.Where(p => !existing.Models.Any(e => e.ExternalId == p.ExternalId)).ToList();

        if (!newPeople.Any()) return result;

        var newEntities = new List<PersonEntity>();

        newPeople.ForEach(p =>
        {
            var newEntity = new PersonEntity
            {
                ExternalId = p.ExternalId,
                Name = p.Name,
            };

            newEntities.Add(newEntity);
        });


        var inserted = await _client.From<PersonEntity>().Insert(newEntities);

        result.AddRange(inserted.Models.Select(p => p.Id).ToList());

        return result;
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
        var movie = new MovieModel
        {
            Id = db.Id,
            Title = db.Title,
            CreatedAt = db.CreatedAt ?? default,
            PosterUrl = db.PosterUrl,
            Overview = db.Overview,
        };

        if (string.IsNullOrEmpty(db.Format))
            movie.Format = MovieFormat.Unknown;
        else
        {
            movie.Format = Enum.Parse<MovieFormat>(db.Format, true);
        }

        if (string.IsNullOrEmpty(db.Genres))
            return movie;

        var genres = JsonSerializer.Deserialize<List<Genre>>(db.Genres);

        movie.Genre.AddRange(genres ?? new List<Genre>());

        return movie;
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

    public async Task<(bool success, string? error)> AddMemberAsync(Guid collectionId, Guid userId, CollectionRole role)
    {
        try
        {
            var roleEntity = new UserCollectionRoleEntity
            {
                UserId = userId,
                CollectionId = collectionId,
                Role = role.ToString().ToLower(),
            };

            var response = await _client.From<UserCollectionRoleEntity>().Insert(roleEntity);

            return (true, null);

        }
        catch (System.Exception e)
        {
            if (e.Message.Contains("23503"))
            {
                return (false, "User not found");
            }

            return (false, e.Message);
        }

    }

    public async Task<bool> UpdateMemberRoleAsync(Guid collectionId, Guid userId, CollectionRole role)
    {
        var userRole = await _client
            .From<UserCollectionRoleEntity>()
            .Where(r => r.CollectionId == collectionId && r.UserId == userId)
            .Single();

        if (userRole is null)
            return false;

        userRole.Role = role.ToString().ToLower();

        await _client.From<UserCollectionRoleEntity>().Update(userRole);

        return true;
    }

    public async Task<bool> RemoveMemberAsync(Guid collectionId, Guid userId)
    {
        var userRole = await _client
            .From<UserCollectionRoleEntity>()
            .Where(r => r.CollectionId == collectionId && r.UserId == userId)
            .Single();

        if (userRole is null)
            return false;

        await _client.From<UserCollectionRoleEntity>().Delete(userRole);

        return true;
    }

    public async Task<bool> IsMaintainerAsync(Guid collectionId, Guid userId)
    {
        var roles = await _client
           .From<UserCollectionRoleEntity>()
           .Where(r => r.CollectionId == collectionId && r.UserId == userId)
           .Get();

        var role = roles.Models.FirstOrDefault();

        if (role is null) return false;

        if (role.Role is null) return false;

        if (role.Role.Equals(CollectionRole.Maintainer.ToString().ToLower(), StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return false;
    }

    public async Task<List<CollectionMember>> GetMembersForCollectionAsync(Guid collectionId)
    {
        var roles = await _client
            .From<UserCollectionRoleEntity>()
            .Where(r => r.CollectionId == collectionId)
            .Get();

        var userIds = roles.Models.Select(r => r.UserId).Distinct().ToList();

        if (!userIds.Any())
            return new List<CollectionMember>();

        var users = await _client
            .From<UserEntity>()
            .Filter("id", Constants.Operator.In, userIds)
            .Get();

        var result = new List<CollectionMember>();

        return roles.Models.Select(r =>
        {
            var user = users.Models.FirstOrDefault(u => Guid.Parse(u.Id) == r.UserId);

            var member = new CollectionMember
            {
                UserId = r.UserId,
                Name = user?.Name ?? "Unknown",
                Role = Enum.Parse<CollectionRole>(r.Role ?? "reader", true)
            };

            return member;
        }).ToList();
    }

    public async Task<Guid> UpdateMovieAsync(MovieModel movie)
    {
        var dbMovie = await _client
            .From<MovieEntity>()
            .Where(m => m.Id == movie.Id)
            .Single();

        if (dbMovie is null)
        {
            throw new Exception("Movie not found");
        }

        dbMovie.Title = movie.Title;
        dbMovie.Format = movie.Format.ToString().ToLower();
        dbMovie.Genres = JsonSerializer.Serialize(movie.Genre);
        dbMovie.PosterUrl = movie.PosterUrl;
        dbMovie.Overview = movie.Overview;

        await _client.From<MovieEntity>().Update(dbMovie);
        await UpdateMoviePersons(dbMovie.Id, movie.Directors, Director);
        await UpdateMoviePersons(dbMovie.Id, movie.Cast, Cast);

        return dbMovie.Id;
    }

    private async Task UpdateMoviePersons(Guid movieId, List<Person> persons, string type)
    {
        var existing = await _client
            .From<MoviePersonEntity>()
            .Where(p => p.MovieId == movieId && p.Type == type)
            .Get();

        var existingRelationships = existing.Models;

        var incomingPersonIds = persons.Select(p => p.Id).ToList();

        var relationshipsToDelete = existingRelationships
            .Where(rel => !incomingPersonIds.Contains(rel.PersonId))
            .ToList();

        if (relationshipsToDelete.Any())
        {
            var deleteIds = relationshipsToDelete.Select(r => r.Id).ToList();

            await _client
                .From<MoviePersonEntity>()
                .Filter("id", Constants.Operator.In, deleteIds)
                .Delete();
        }

        var existingPersonIds = existingRelationships
            .Select(rel => rel.PersonId)
            .ToHashSet();

        var personsToLink = persons
            .Where(p => !existingPersonIds.Contains(p.Id))
            .ToList();

        if (personsToLink.Any())
        {
            var newRelationships = personsToLink.Select(p => new MoviePersonEntity
            {
                MovieId = movieId,
                PersonId = p.Id,
                Type = type,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            await _client
                .From<MoviePersonEntity>()
                .Insert(newRelationships);
        }
    }
}
