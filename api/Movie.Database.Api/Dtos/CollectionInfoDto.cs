using System;

namespace Movie.Database.Api.Dtos;

public class CollectionInfoDto
{
    public Guid Id { get; set; } = default!;
    public string? Name { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = default!;
    public CollectionRoleDto RoleForCurrentUser { get; set; } = default!;
    public List<CollectionInfoUserDto> users { get; set; } = default!;
}

public class CollectionInfoUserDto
{
    public Guid Id { get; set; } = default!;
    public string? Name { get; set; } = default!;
    public CollectionRoleDto CurrentRole { get; set; } = default!;
}