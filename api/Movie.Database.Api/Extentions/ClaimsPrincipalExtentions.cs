using System;
using System.Security.Claims;
using Movie.Database.Api.Models;

namespace Movie.Database.Api.Extentions;

public static class ClaimsPrincipalExtentions
{
    public static UserMetadata? GetUserId(this ClaimsPrincipal principal)
    {
        var metadataClaim = principal.FindFirst("user_metadata")?.Value;
        if (metadataClaim is null)
            return null;

        var metadata = System.Text.Json.JsonSerializer.Deserialize<UserMetadata>(metadataClaim);

        return metadata;
    }
}
