using System;

namespace Movie.Database.Api.Dtos;

public class ChangeRoleRequest
{
    public Guid CollectionId { get; set; } = default!;
    public Guid UserIdToChange { get; set; } = default!;
    public CollectionRoleDto Role { get; set; }
}
