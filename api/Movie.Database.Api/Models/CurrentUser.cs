using System;

namespace Movie.Database.Api.Models;

public class CurrentUser
{
    public Guid Id { get; init; }
    public string? Email { get; init; }
    public string? Name { get; init; }
}
