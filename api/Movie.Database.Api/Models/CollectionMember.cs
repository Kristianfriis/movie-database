using System;

namespace Movie.Database.Api.Models;

public class CollectionMember
{
    public Guid UserId { get; set; }
    public string? Name { get; set; } // Optional: for display
    public CollectionRole Role { get; set; }
}

public enum CollectionRole
{
    Maintainer,
    Reader
}
