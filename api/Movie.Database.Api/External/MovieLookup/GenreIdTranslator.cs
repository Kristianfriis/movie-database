using System;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.External.MovieLookup;

public static class GenreIdTranslator
{
    // Key: External API ID (e.g., 28)
    // Value: Internal Enum ID (e.g., 1)
    private static readonly Dictionary<int, int> ExternalToInternalMap = new Dictionary<int, int>()
    {
        // External ID  | Internal Enum ID
        { 28, 1 },      // Action
        { 12, 2 },      // Adventure
        { 16, 3 },      // Animation
        { 35, 4 },      // Comedy
        { 80, 5 },      // Crime
        { 99, 6 },      // Documentary
        { 18, 7 },      // Drama
        { 10751, 8 },   // Family
        { 14, 9 },      // Fantasy
        { 36, 10 },     // History
        { 27, 11 },     // Horror
        { 10402, 12 },  // Music
        { 9648, 13 },   // Mystery
        { 10749, 14 },  // Romance
        { 878, 15 },    // Science Fiction
        { 10770, 16 },  // TV Movie
        { 53, 17 },     // Thriller
        { 10752, 18 },  // War
        { 37, 19 }      // Western
    };

    /// <summary>
    /// Converts an external API genre ID to the internal Genre enum value.
    /// </summary>
    /// <param name="externalId">The ID from the external API.</param>
    /// <returns>The corresponding internal Genre enum value.</returns>
    public static Genre ConvertToInternalGenre(this int? externalId)
    {
        if(externalId is null)
            return Genre.Unknown;

        // Try to find the internal ID in the map
        if (ExternalToInternalMap.TryGetValue(externalId.Value, out int internalId))
        {
            // Cast the internal ID to the Genre enum
            return (Genre)internalId;
        }

        // Return the Unknown member if no match is found
        return Genre.Unknown;
    }
}