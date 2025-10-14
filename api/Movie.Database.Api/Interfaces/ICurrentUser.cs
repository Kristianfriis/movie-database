using System;

namespace Movie.Database.Api.Interfaces;

public interface ICurrentUser
{
    Guid Id { get; }
    string? Email { get; }
    string? Name { get; }
}
