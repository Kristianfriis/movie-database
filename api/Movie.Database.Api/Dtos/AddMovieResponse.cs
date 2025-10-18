using System;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.Dtos;

public class AddMovieResponse
{
    public List<MovieModel> Movies { get; set; } = new();
    public string? Error { get; set; }
    public bool Success { get; set; } = true;
    public bool NeedMoreInfo { get; set; } = false;
}
