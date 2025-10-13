using System;

namespace Movie.Database.Api.Dtos;

public class JoinCollectionRequest
{
    public Guid CollectionId { get; set; } = default!;
    public Guid UserId { get; set; } = default!;
    public Guid UserIdToAdd { get; set; } = default!;
    public CollectionRoleDto Role { get; set; } = CollectionRoleDto.Reader;
}

public enum CollectionRoleDto
{
    Maintainer,
    Reader
}
