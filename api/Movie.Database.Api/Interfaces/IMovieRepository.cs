using System;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.Interfaces;

public interface IMovieRepository
{
    Task<MovieModel?> GetByIdAsync(Guid id);
    Task<List<MovieModel>> GetByCollectionAsync(Guid collectionId);
    Task<Guid> AddToCollectionAsync(Guid collectionId, MovieModel movie);
    Task RemoveFromCollectionAsync(Guid collectionId, Guid movieId);
    Task<List<AvailableCollection>> GetAvailableCollectionsAsync(Guid userId);
    Task<Guid> CreateCollectionAsync(string name, Guid ownerId);
    Task<(bool success, string? error)> AddMemberAsync(Guid collectionId, Guid userId, CollectionRole role);
    Task<bool> UpdateMemberRoleAsync(Guid collectionId, Guid userId, CollectionRole role);
    Task<bool> RemoveMemberAsync(Guid collectionId, Guid userId);
    Task<bool> IsMaintainerAsync(Guid collectionId, Guid userId);
    Task<List<CollectionMember>> GetMembersForCollectionAsync(Guid collectionId);
}
