using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.Services;

public class CollectionService : ICollectionService
{
    private readonly IMovieRepository _repo;
    private readonly IConfiguration _config;

    public CollectionService(IMovieRepository repo, IConfiguration config)
    {
        _repo = repo;
        _config = config;
    }

    public async Task<(string? token, string? error)> GenerateInviteAsync(Guid collectionId, Guid userId)
    {
        if (!await _repo.IsMaintainerAsync(collectionId, userId))
            return (null, "User is not a maintainer of the collection");

        var secret = _config["InviteSecret"];
        if (string.IsNullOrEmpty(secret))
            throw new Exception("Invite secret is not configured");

        var token = GenerateInviteKey(collectionId, secret);

        return (token, null);
    }

    public (Guid? collectionId, string? error) DecodeInvite(string token, out Guid collectionId)
    {
        var secret = _config["InviteSecret"];
        if (string.IsNullOrEmpty(secret))
            throw new Exception("Invite secret is not configured");

        var result = TryDecodeInviteKey(token, secret, out collectionId);
        if (!result)
            return (null, "Invalid or expired invite token");

        return (collectionId, null);
    }

    private string GenerateInviteKey(Guid collectionId, string secret)
    {
        var payload = new InvitePayload(collectionId.ToString(), DateTime.UtcNow.AddHours(1));
        var json = JsonSerializer.Serialize(payload);
        var bytes = Encoding.UTF8.GetBytes(json);

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var signature = hmac.ComputeHash(bytes);

        var token = Convert.ToBase64String(bytes) + "." + Convert.ToBase64String(signature);
        return token;
    }

    private bool TryDecodeInviteKey(string token, string secret, out Guid collectionId)
    {
        collectionId = Guid.Empty;

        var parts = token.Split('.');
        if (parts.Length != 2) return false;

        var payloadBytes = Convert.FromBase64String(parts[0]);
        var signature = Convert.FromBase64String(parts[1]);

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var expectedSig = hmac.ComputeHash(payloadBytes);

        if (!signature.SequenceEqual(expectedSig)) return false;

        var payload = JsonSerializer.Deserialize<InvitePayload>(Encoding.UTF8.GetString(payloadBytes));
        if (payload == null) return false;

        if (payload.exp < DateTime.UtcNow) return false;

        return Guid.TryParse(payload.collectionId, out collectionId);
    }

    public async Task<(bool success, string? error)> JoinCollectionAsync(string token, Guid userId)
    {
        var (collectionId, error) = DecodeInvite(token, out var _);
        if (error is not null || collectionId is null)
            return (false, error);

        try
        {
            await _repo.AddMemberAsync(collectionId.Value, userId, CollectionRole.Reader);
            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    public async Task<(bool success, string? error)> JoinCollectionAsync(Guid collectionId, Guid userId, Guid userIdToAdd, CollectionRole role)
    {
        if (!await _repo.IsMaintainerAsync(collectionId, userId))
            return (false, "User is not a maintainer of the collection");

        var coll = await _repo.GetAvailableCollectionsAsync(userIdToAdd);

        var exist = coll.FirstOrDefault(c => c.Id == collectionId);

        if (exist is not null)
            return (false, "User is already in the collection");

        try
        {
            await _repo.AddMemberAsync(collectionId, userIdToAdd, role);
            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    public async Task<(AvailableCollection? availableCollection, string? error)> GetCollectionInfoAsync(Guid collectionId, Guid userId)
    {
        var coll = await _repo.GetAvailableCollectionsAsync(userId);

        var exist = coll.FirstOrDefault(c => c.Id == collectionId);

        if (exist is null)
            return (null, "Collection not found");

        return (exist, null);
    }
}

record InvitePayload(string collectionId, DateTime exp);
