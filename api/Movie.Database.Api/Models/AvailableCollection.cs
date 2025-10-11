using System;

namespace Movie.Database.Api.Models;

public class AvailableCollection
{
    public int IndexId { get; set; } // Internal index for ordering
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public DateTime CreatedAt { get; set; }

    public CollectionRole Role { get; set; } // The current user's role in this collection

    public List<CollectionMember> Members { get; set; } = new();
}
