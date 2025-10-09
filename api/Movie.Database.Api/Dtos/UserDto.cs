using System;

namespace Movie.Database.Api.Dtos;

public class UserDto
{
    public string Id { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? Name { get; set; }
    // public DateTime CreatedAt { get; set; }
}
