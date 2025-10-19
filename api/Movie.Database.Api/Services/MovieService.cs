using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.Services;

public class MovieService : IMovieService
{
    private readonly IMovieRepository _repo;
    private readonly IMovieLookup _lookup;
    private readonly IPersonRepository _personRepo;


    public MovieService(IMovieRepository repo, IMovieLookup lookup, IPersonRepository personRepo)
    {
        _repo = repo;
        _lookup = lookup;
        _personRepo = personRepo;
    }

    public async Task<(List<MovieModel> movies, bool needmoreinfo, string? error)> AddToCollectionAsync(Guid collectionId, MovieModel movie)
    {
        // get movie details from movie lookup if any
        // if more than 1 entry, return them all, user needs to choose the correct
        // if only 1, add the movie to database, and return the list with 1 entry
        // if none, add the details available, and set the needmoreinfo flag. 

        if (string.IsNullOrEmpty(movie.Title))
        {
            return (new List<MovieModel>(), false, "Movie title is required");
        }

        var movies = await _repo.SearchMoviesAsync(movie.Title);
        var foundInDb = movies.Any();

        if (!movies.Any())
        {
            var moviesFromLookup = await _lookup.GetMovieDetailsByMovieNameAsync(movie.Title);
            movies = moviesFromLookup;
        }

        if (movies.Any())
        {
            if (movies.Count() > 1)
            {
                return (movies, true, null);
            }
            else
            {
                try
                {
                    var movieToReturn = movies.First();

                    if (foundInDb)
                    {
                        movieToReturn.Format = movie.Format;
                        var linkId = await _repo.LinkMovieToCollection(collectionId, movieToReturn);
                        return (new List<MovieModel>() { movieToReturn }, false, null);
                    }

                    movieToReturn.Format = movie.Format;
                    movieToReturn.Title = movie.Title;
                    
                    var directors = await _personRepo.CreatePersons(movieToReturn.Directors);
                    var cast = await _personRepo.CreatePersons(movieToReturn.Cast);

                    movieToReturn.Directors = directors;
                    movieToReturn.Cast = cast;

                    var id = await _repo.AddToCollectionAsync(collectionId, movieToReturn);

                    movieToReturn.Id = id;

                    return (new List<MovieModel>() { movieToReturn }, false, null);
                }
                catch (System.Exception e)
                {
                    Console.WriteLine(e.Message);
                    return (new List<MovieModel>(), false, "Failed to add movie to collection");
                }
            }
        }

        try
        {
            var id = await _repo.AddToCollectionAsync(collectionId, movies.First());

            movie.Id = id;
            return (new List<MovieModel>() { movie }, false, null);
        }
        catch (System.Exception)
        {
            return (new List<MovieModel>(), false, "Failed to add movie to collection");
        }
    }

    public async Task<(bool success, string? error, MovieModel? movie)> GetMovieAsync(Guid id, Guid? collectionId = null)
    {
        (bool success, string? error, MovieModel? movie) result = (true, null, null);

        var movie = await _repo.GetByIdAsync(id, collectionId);

        if (movie is null)
        {
            result = (false, "Movie not found", null);
            return result;
        }

        result = (true, null, movie);
        return result;
    }

    public async Task<(bool success, string? error, Guid? id)> UpdateMovieAsync(MovieModel movie, Guid? collectionId = null)
    {
        var movieExist = await _repo.GetByIdAsync(movie.Id, collectionId);

        if (movieExist is null)
        {
            return (false, "Movie not found", null);
        }

        try
        {
            var id = await _repo.UpdateMovieAsync(movie, collectionId);

            return (true, null, id);
        }
        catch (System.Exception)
        {

            return (false, "Failed to update movie", null);
        }
    }

}
