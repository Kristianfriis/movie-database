using System;
using System.Text.Json;
using Movie.Database.Api.Models;
using Movie.Database.Api.Persistence.Entities;

namespace Movie.Database.Api.Persistence.Mappers;

public static class MovieMapper
{
    public static MovieModel MapToDomain(this MovieEntity db, string? format = null)
    {
        var result = new MovieModel();

        result.Id = db.Id;
        result.Title = db.Title;
        result.CreatedAt = db.CreatedAt ?? default;
        result.PosterUrl = db.PosterUrl;
        result.Overview = db.Overview;

        if (!string.IsNullOrEmpty(db.Genres))
        {
            var genres = JsonSerializer.Deserialize<List<Genre>>(db.Genres);

            result.Genre.AddRange(genres ?? new List<Genre>());
        }

        if (format is not null)
        {
            result.Format = Enum.Parse<MovieFormat>(format, true);
        } else
        {
            result.Format = MovieFormat.Unknown;
        }

        return result;
    }

    public static MovieEntity MapToEntity(this MovieModel movie)
    {
        var result = new MovieEntity();

        result.Id = movie.Id;
        result.Title = movie.Title;
        result.CreatedAt = DateTime.UtcNow;
        result.PosterUrl = movie.PosterUrl;
        result.Overview = movie.Overview;
        result.Genres = JsonSerializer.Serialize(movie.Genre);

        return result;
    }
}
