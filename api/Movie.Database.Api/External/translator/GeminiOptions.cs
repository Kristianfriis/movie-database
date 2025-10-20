using System;

namespace Movie.Database.Api.External.translator;

public class GeminiOptions
{
    public const string Position = "Gemini";

    public string Url { get; set; } = String.Empty;
    public string Key { get; set; } = String.Empty;

}
