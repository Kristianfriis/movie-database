using Movie.Database.Api.Models;

namespace Movie.Database.Api.Interfaces;

public interface IMovieService
{
    Task<(bool success, string? error, Guid? id)> AddFullMovieDetailsAsync(Guid collectionId, MovieModel movie);
    Task<(List<MovieModel> movies, bool needmoreinfo, string? error)> AddToCollectionAsync(Guid collectionId, MovieModel movie, Languages searchLanguage);
    Task<(bool success, string? error, MovieModel? movie)> GetMovieAsync(Guid id, Guid? collectionId = null);
    Task<(bool success, string? error, Guid? id)> UpdateMovieAsync(MovieModel movie, Guid? collectionId = null);
}