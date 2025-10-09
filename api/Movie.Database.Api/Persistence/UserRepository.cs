using System;
using Movie.Database.Api.Models;
using Movie.Database.Api.Persistence.Entities;

namespace Movie.Database.Api.Persistence;

public class UserRepository
{
    protected readonly Supabase.Client _client;

    public UserRepository(Supabase.Client client)
    {
        _client = client;
    }

    public async Task<User?> GetUsersAsync(string userId)
    {
        var existing = await _client
            .From<UserEntity>()
            .Where(u => u.Id == userId)
            .Get();

        var result = existing.Models.FirstOrDefault();

        var mappedResult = result is null ? null : new User
        {
            Id = result.Id,
            Email = result.Email,
            Name = result.Name,
            CreatedAt = result.CreatedAt
        };

        return mappedResult;
    }

    public async Task<User?> GetUserByAuthId(string authId)
    {
        var existing = await _client
            .From<UserEntity>()
            .Where(u => u.AuthId == authId)
            .Get();

        var result = existing.Models.FirstOrDefault();

        var mappedResult = result is null ? null : new User
        {
            Id = result.Id,
            Email = result.Email,
            Name = result.Name,
            CreatedAt = result.CreatedAt
        };

        return mappedResult;
    }

    public async Task<User> CreateUserAsync(string userId, string email, string? name)
    {
        var newUser = new UserEntity
        {
            Email = email,
            Name = name,
            CreatedAt = DateTime.UtcNow,
            AuthId = userId
        };

        var inserted = await _client
            .From<UserEntity>()
            .Insert(newUser)
            ;

        var result = inserted.Models.First();

        var mappedResult = new User
        {
            Id = result.Id,
            Email = result.Email,
            Name = result.Name,
            CreatedAt = result.CreatedAt
        };

        return mappedResult;
    }

    public async Task<User?> UpdateUserAsync(User user)
    {
        var existing = await _client
            .From<UserEntity>()
            .Where(u => u.Id == user.Id)
            .Get();

        var userToUpdate = existing.Models.FirstOrDefault();

        if (userToUpdate is null)
            return null;

        userToUpdate.Name = user.Name ?? userToUpdate.Name;
        userToUpdate.Email = user.Email ?? userToUpdate.Email;

        var updated = await _client
            .From<UserEntity>()
            .Update(userToUpdate)
            ;

        var result = updated.Models.FirstOrDefault();

        if (result is null)
            return null;

        var mappedResult = new User
        {
            Id = result.Id,
            Email = result.Email,
            Name = result.Name,
            CreatedAt = result.CreatedAt
        };

        return mappedResult;
    }
}
