using System;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.Interfaces;

public interface IMovieRepository
{
    Task<MovieModel?> GetByIdAsync(Guid id);
    Task<List<MovieModel>> GetByCollectionAsync(Guid collectionId);
    Task AddToCollectionAsync(Guid collectionId, MovieModel movie);
    Task RemoveFromCollectionAsync(Guid collectionId, Guid movieId);
    Task<List<AvailableCollection>> GetAvailableCollectionsAsync(Guid userId);
    Task<Guid> CreateCollectionAsync(string name, Guid ownerId);
    Task AddMemberAsync(Guid collectionId, Guid userId, CollectionRole role);
    Task UpdateMemberRoleAsync(Guid collectionId, Guid userId, CollectionRole role);
    Task RemoveMemberAsync(Guid collectionId, Guid userId);
}
