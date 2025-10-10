using System;

namespace Movie.Database.Api.Models;

public class MovieCollection
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<MovieModel> Movies { get; set; } = new();
    public List<CollectionMember> Members { get; set; } = new();
}
