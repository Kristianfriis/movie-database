using System;

namespace Movie.Database.Api.Models;

public class MovieModel
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public DateTime CreatedAt { get; set; }
}
