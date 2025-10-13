using System;

namespace Movie.Database.Api.Dtos;

public class CollectionInfoDto
{
    public Guid Id { get; set; } = default!;
    public string? Name { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = default!;
    public CollectionRoleDto RoleForCurrentUser { get; set; } = default!;
}
