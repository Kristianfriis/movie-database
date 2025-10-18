using System;
using System.Net;
using Microsoft.Extensions.Options;
using Movie.Database.Api.External.MovieLookup.Models;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.External.MovieLookup;

public class TmdbClient : IMovieLookup
{
    private readonly HttpClient _client;

    public TmdbClient(IOptions<MovieLookupOptions> options)
    {
        var settings = options.Value;
        var url = settings.Url;
        var key = settings.Key;

        if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(key))
        {
            throw new ArgumentNullException(nameof(url), nameof(key));
        }

        var client = new HttpClient();
        client.BaseAddress = new Uri(url);
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {key}");
        client.DefaultRequestHeaders.Add("accept", "application/json");
        _client = client;
    }

    public async Task<PersonList> GetCredits(int movieId)
    {
        var response = await _client.GetAsync("movie/" + movieId + "/credits?language=en-US");

        var body = await response.Content.ReadFromJsonAsync<CreditsResponse>();

        var result = new PersonList();

        if (body is null)
            return result;

        foreach (var cast in body.Cast)
        {
            var person = new Person
            {
                Id = cast.Id,
                Name = cast.Name,
                ExternalId = cast.Id,
            };

            result.Cast.Add(person);
        }

        var director = body.Crew.FirstOrDefault(c => c.Job == "Director");

        if (director is not null)
        {
            var person = new Person
            {
                Id = director.Id,
                Name = director.Name,
                ExternalId = director.Id,
            };

            result.Directors.Add(person);
        }

        return result;
    }

    public async Task<List<MovieModel>> GetMovieDetailsByMovieNameAsync(string movieName)
    {
        if (string.IsNullOrEmpty(movieName))
        {
            return new List<MovieModel>();
        }

        string encodedMovieName = WebUtility.UrlEncode(movieName);

        string apiPath = $"search/movie?query={encodedMovieName}&include_adult=false&language=da-DK&page=1";

        var response = await _client.GetAsync(apiPath);

        var result = await response.Content.ReadFromJsonAsync<MovieSearchResponse>();

        if (result is null)
            return new List<MovieModel>();

        var movies = new List<MovieModel>();

        foreach (var movie in result.Results)
        {
            var movieModel = new MovieModel
            {
                Id = Guid.NewGuid(),
                Title = movie.Title,
                Format = MovieFormat.Unknown,
                Overview = movie.Overview,
            };

            var credits = await GetCredits(movie.Id);

            movieModel.Directors = credits.Directors;
            movieModel.Cast = credits.Cast;

            movies.Add(movieModel);
        }

        return movies;
    }
}

public interface IMovieLookup
{
    public Task<List<MovieModel>> GetMovieDetailsByMovieNameAsync(string movieName);
}

public class PersonList
{
    public List<Person> Cast { get; set; } = new();
    public List<Person> Directors { get; set; } = new();
}