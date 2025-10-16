using System;
using Microsoft.Extensions.Options;
using Movie.Database.Api.External.MovieLookup.Models;

namespace Movie.Database.Api.External.MovieLookup;

public class TmdbClient
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

    public async Task GetMovieDetails()
    {
        var response = await _client.GetAsync("search/movie?query=de%20gr%C3%B8nne%20slagtere&include_adult=false&language=da-DK&page=1");

        var body = await response.Content.ReadFromJsonAsync<MovieSearchResponse>();

        Console.WriteLine(body?.Results.Count);
        Console.WriteLine(body?.Results[0].Id);
    }

    public async Task GetCredits(int movieId)
    {
        var response = await _client.GetAsync("movie/" + movieId + "/credits?language=en-US");

        var body = await response.Content.ReadFromJsonAsync<CreditsResponse>();

        Console.WriteLine(body?.Cast.Count);
    }
}
