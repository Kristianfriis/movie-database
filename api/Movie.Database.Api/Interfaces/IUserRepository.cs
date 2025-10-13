using Movie.Database.Api.Models;

namespace Movie.Database.Api.Interfaces;

public interface IUserRepository
{
    Task<User> CreateUserAsync(string userId, string email, string? name);
    Task<List<User>> GetAllUsersAsync();
    Task<User?> GetUserByAuthId(string authId);
    Task<User?> GetUsersAsync(string userId);
    Task<User?> UpdateUserAsync(User user);
}
