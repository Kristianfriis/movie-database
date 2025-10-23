using System;
using System.Net;
using Flurl;
using Flurl.Http;
using Microsoft.Extensions.Options;
using Movie.Database.Api.Extentions;
using Movie.Database.Api.External.MovieLookup.Models;
using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.External.MovieLookup;

public class TmdbClient : IMovieLookup
{
    private readonly HttpClient _client;
    private readonly MovieLookupOptions _settings;
    public TmdbClient(IOptions<MovieLookupOptions> options)
    {
        var settings = options.Value;
        var url = settings.Url;
        var key = settings.Key;

        _settings = settings;

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
        var response = await _settings.Url
            .WithOAuthBearerToken(_settings.Key)
            .AppendPathSegment("movie")
            .AppendPathSegment(movieId.ToString())
            .AppendPathSegment("credits")
            .SetQueryParam("language", "en-US")
            .GetJsonAsync<CreditsResponse>();

        var result = new PersonList();

        if (response is null)
            return result;

        foreach (var cast in response.Cast)
        {
            var person = new Person
            {
                Id = cast.Id,
                Name = cast.Name,
                ExternalId = cast.Id,
            };

            result.Cast.Add(person);
        }

        var director = response.Crew.FirstOrDefault(c => c.Job == "Director");

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

    public async Task<List<MovieModel>> GetMovieDetailsByMovieNameAsync(string movieName, Languages searchLanguage)
    {
        if (string.IsNullOrEmpty(movieName))
        {
            return new List<MovieModel>();
        }

        var result = await _settings.Url
            .WithOAuthBearerToken(_settings.Key)
            .AppendPathSegment("search/movie")
            .SetQueryParam("query", movieName)
            .SetQueryParam("include_adult", "false")
            .SetQueryParam("language", searchLanguage.GetDescription() ?? "en-US")
            .SetQueryParam("page", "1")
            .GetJsonAsync<MovieSearchResponse>();

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
                Genre = movie.GenreIds.Select(p => GenreIdTranslator.ConvertToInternalGenre(p)).ToList(),
            };

            var credits = await GetCredits(movie.Id);

            movieModel.Directors = credits.Directors;
            movieModel.Cast = credits.Cast;

            movies.Add(movieModel);
        }

        return movies;
    }
}

public class PersonList
{
    public List<Person> Cast { get; set; } = new();
    public List<Person> Directors { get; set; } = new();
}