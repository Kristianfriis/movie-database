using System;

namespace Movie.Database.Api.Dtos;

public class JoinCollectionRequest
{
    public string Token { get; set; } = default!;
    public Guid UserId { get; set; } = default!;
}
