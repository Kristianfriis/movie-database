using System;

namespace Movie.Database.Api.Interfaces;

public interface ICurrentUser
{
    Guid Id { get; set; }
    string? Email { get; set; }
    string? Name { get; set; }
}
