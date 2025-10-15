using System;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.Interfaces;

public interface ICollectionService
{
    Task<(string? token, string? error)> GenerateInviteAsync(Guid collectionId, Guid userId);
    (Guid? collectionId, string? error) DecodeInvite(string token, out Guid collectionId);
    Task<(bool success, string? error)> JoinCollectionAsync(Guid collectionId, Guid userId, Guid userIdToAdd, CollectionRole role);
    Task<(AvailableCollection? availableCollection, string? error)> GetCollectionInfoAsync(Guid collectionId, Guid userId);
    Task<(bool success, string? error)> ChangeRoleForUserAsync(Guid collectionId, Guid userIdToChange, CollectionRole role);
    Task<(bool success, string? error)> RemoveMemberAsync(Guid collectionId, Guid userId);
}