using System;

namespace Movie.Database.Api.Dtos;

public class RemoveUserFromCollectionRequest
{
    public Guid CollectionId { get; set; } = default!;
    public Guid UserId { get; set; } = default!;
}
