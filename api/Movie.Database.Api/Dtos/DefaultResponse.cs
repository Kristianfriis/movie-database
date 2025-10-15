using System;

namespace Movie.Database.Api.Dtos;

public class DefaultResponse
{
    public bool success { get; set; } = true;
    public string? error { get; set; }
}
