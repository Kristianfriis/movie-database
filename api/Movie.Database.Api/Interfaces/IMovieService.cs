using Movie.Database.Api.Models;

namespace Movie.Database.Api.Interfaces;

public interface IMovieService
{
    Task<(List<MovieModel> movies, bool needmoreinfo, string? error)> AddToCollectionAsync(Guid collectionId, MovieModel movie);
    Task<(bool success, string? error, MovieModel? movie)> GetMovieAsync(Guid id);
    Task<(bool success, string? error, Guid? id)> UpdateMovieAsync(MovieModel movie);
}