using System;
using Movie.Database.Api.Interfaces;

namespace Movie.Database.Api.Models;

public class CurrentUser : ICurrentUser
{
    public Guid Id { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
}
