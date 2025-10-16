using Castle.Core.Configuration;
using Microsoft.Extensions.Options;
using Movie.Database.Api.External.MovieLookup;
using NSubstitute;

namespace Movie.Database.Api.Tests;

public class Tests
{
    [SetUp]
    public void Setup()
    {
    }

    [Test]
    public async Task Test1()
    {
        var testSettings = new MovieLookupOptions
        {
            Url = "https://api.themoviedb.org/3/",
            //Key = "test_api_key_123"
            Key = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzMTEyOTQyODllNjEzYWYxYzRiNzc2ZTY4MWIzYjFmNyIsIm5iZiI6MTc2MDU0NjI1MS44MzksInN1YiI6IjY4ZWZjZGNiMmRiOTVjZGZmNzJiZWI2ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kiw1JVdzbJLyxkgFNlRruBChkj_oW1d6OXU7zL-zg_Y"
        };

        var mockOptions = Substitute.For<IOptions<MovieLookupOptions>>();

        mockOptions.Value.Returns(testSettings);

        var client = new TmdbClient(mockOptions);

        await client.GetMovieDetails();

        Assert.Pass();
    }

    [Test]
    public async Task Test2()
    {
        var testSettings = new MovieLookupOptions
        {
            Url = "https://api.themoviedb.org/3/",
            //Key = "test_api_key_123"
            Key = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzMTEyOTQyODllNjEzYWYxYzRiNzc2ZTY4MWIzYjFmNyIsIm5iZiI6MTc2MDU0NjI1MS44MzksInN1YiI6IjY4ZWZjZGNiMmRiOTVjZGZmNzJiZWI2ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kiw1JVdzbJLyxkgFNlRruBChkj_oW1d6OXU7zL-zg_Y"
        };

        var mockOptions = Substitute.For<IOptions<MovieLookupOptions>>();

        mockOptions.Value.Returns(testSettings);

        var client = new TmdbClient(mockOptions);

        await client.GetCredits(4972);

        Assert.Pass();
    }
}
