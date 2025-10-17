using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.Services;

public class MovieService : IMovieService
{
    private readonly IMovieRepository _repo;

    public MovieService(IMovieRepository repo)
    {
        _repo = repo;
    }

    public async Task<(bool success, string? error, MovieModel? movie)> GetMovieAsync(Guid id)
    {
        (bool success, string? error, MovieModel? movie) result = (true, null, null);

        var movie = await _repo.GetByIdAsync(id);

        if (movie is null)
        {
            result = (false, "Movie not found", null);
            return result;
        }

        result = (true, null, movie);
        return result;
    }

    public async Task<(bool success, string? error, Guid? id)> UpdateMovieAsync(MovieModel movie)
    {
        var movieExist = await _repo.GetByIdAsync(movie.Id);

        if (movieExist is null)
        {
            return (false, "Movie not found", null);
        }

        try
        {
            var id = await _repo.UpdateMovieAsync(movie);

            return (true, null, id);
        }
        catch (System.Exception)
        {

            return (false, "Failed to update movie", null);
        }
    }

}
