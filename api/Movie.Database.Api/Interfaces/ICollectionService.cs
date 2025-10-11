using System;

namespace Movie.Database.Api.Interfaces;

public interface ICollectionService
{
    Task<(string? token, string? error)> GenerateInviteAsync(Guid collectionId, Guid userId);
    (Guid? collectionId, string? error) DecodeInvite(string token, out Guid collectionId);
    Task<(bool success, string? error)> JoinCollectionAsync(string token, Guid userId);
}