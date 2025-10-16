using System;

namespace Movie.Database.Api.External.MovieLookup;

public class MovieLookupOptions
{
    public const string Position = "MovieLookup";

    public string Url { get; set; } = String.Empty;
    public string Key { get; set; } = String.Empty;

}
