using System;
using Microsoft.Extensions.Options;
using Movie.Database.Api.External.MovieLookup;
using NSubstitute;

namespace Movie.Database.Api.Tests.External.MovieLookup;

[TestFixture]
public class ClientTests
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
            Key = " < Key here >  "
        };

        var mockOptions = Substitute.For<IOptions<MovieLookupOptions>>();

        mockOptions.Value.Returns(testSettings);

        var client = new TmdbClient(mockOptions);

        var result = await client.GetMovieDetailsByMovieNameAsync("de grønne slagtere");

        Assert.Pass();
    }

    [Test]
    public async Task Test2()
    {
        var testSettings = new MovieLookupOptions
        {
            Url = "https://api.themoviedb.org/3/",
            Key = " < Key here >  "
        };

        var mockOptions = Substitute.For<IOptions<MovieLookupOptions>>();

        mockOptions.Value.Returns(testSettings);

        var client = new TmdbClient(mockOptions);

        var result = await client.GetCredits(4972);

        Assert.Pass();
    }
}
