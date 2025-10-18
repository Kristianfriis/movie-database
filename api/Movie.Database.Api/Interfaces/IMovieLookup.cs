using Movie.Database.Api.Models;

namespace Movie.Database.Api.Interfaces;

public interface IMovieLookup
{
    public Task<List<MovieModel>> GetMovieDetailsByMovieNameAsync(string movieName);
}
