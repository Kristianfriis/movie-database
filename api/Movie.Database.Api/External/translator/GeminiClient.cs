using System;
using System.Text.Json.Serialization;
using Flurl.Http;
using Microsoft.Extensions.Options;

namespace Movie.Database.Api.External.translator;

public class GeminiClient
{
    private readonly GeminiOptions _settings;

    public GeminiClient(IOptions<GeminiOptions> options)
    {
        _settings = options.Value;
    }

    public async Task<(string? response, bool success)> Translate(string text, string targetLanguage)
    {
        var prompt = $"translate to {targetLanguage}, just give the translation: {text}";

        var requestBody = new
        {
            contents = new[]
        {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        try
        {
            // 3. Use Flurl's fluent interface to build and send the request
            var response = await _settings.Url
                .WithHeader("x-goog-api-key", _settings.Key) // Set the API key header
                .PostJsonAsync(requestBody)            // Set the HTTP method (POST) and serialize the JSON body
                .ReceiveJson<GeminiResponse>();                      // Get the response body as a string

            if (response is null)
            {
                return ("No response from API", false);
            }

            var candidate = response?.Candidates?.FirstOrDefault();

            if(candidate is null)
            {
                return ("No candidate found", false);
            }

            var content = candidate.Content;

            if (content is null)
            {
                return ("No content found", false);
            }

            var part = content.Parts?.FirstOrDefault();

            if (part is null)
            {
                return ("No part found", false);
            }

            return (part.Text, true);
        }
        catch (FlurlHttpException ex)
        {
            // Handle HTTP errors (e.g., 400 Bad Request, 403 Forbidden)
            string error = await ex.GetResponseStringAsync();
            return ($"An error occurred: {ex.Message}. API Response: {error}", false);
        }
    }
}

public class GeminiResponse
{
    [JsonPropertyName("candidates")]
    public List<Candidate>? Candidates { get; set; }

    [JsonPropertyName("usageMetadata")]
    public UsageMetadata? UsageMetadata { get; set; }

    // Other top-level properties like modelVersion, responseId, etc., can be added if needed
}

// Represents a generated content block
public class Candidate
{
    [JsonPropertyName("content")]
    public Content? Content { get; set; }

    [JsonPropertyName("finishReason")]
    public string? FinishReason { get; set; }

    [JsonPropertyName("index")]
    public int Index { get; set; }
}

// Represents the content, including the role and parts
public class Content
{
    [JsonPropertyName("parts")]
    public List<Part>? Parts { get; set; }

    [JsonPropertyName("role")]
    public string? Role { get; set; }
}

// Represents a single part of the content (where the generated text lives)
public class Part
{
    [JsonPropertyName("text")]
    public string? Text { get; set; }
}

// Represents the token usage data (optional, but good practice)
public class UsageMetadata
{
    [JsonPropertyName("promptTokenCount")]
    public int PromptTokenCount { get; set; }

    [JsonPropertyName("candidatesTokenCount")]
    public int CandidatesTokenCount { get; set; }

    [JsonPropertyName("totalTokenCount")]
    public int TotalTokenCount { get; set; }
    // ... other usage metadata can be added
}
