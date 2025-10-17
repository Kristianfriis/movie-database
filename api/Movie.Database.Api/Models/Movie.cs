using System;

namespace Movie.Database.Api.Models;

public class MovieModel
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public List<Genre> Genre { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public MovieFormat Format { get; set; }
    public string? PosterUrl { get; set; }
    public string? Overview { get; set; }
    public List<Person> Cast { get; set; } = new();
    public List<Person> Directors { get; set; } = new();
}

public enum MovieFormat
{
    DVD,
    Bluray,
    Digital,
    Unknown,
}

public class Person
{
    public long Id { get; set; }
    public string? Name { get; set; }
    public long ExternalId { get; set; }
}