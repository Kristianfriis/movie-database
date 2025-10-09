using System;

namespace Movie.Database.Api.Models;

public class User
{
    public string Id { get; set; } = default!; // Supabase Auth UUID
    public string Email { get; set; } = default!;
    public string? Name { get; set; }
    public DateTime CreatedAt { get; set; }
}
