using System;

namespace Movie.Database.Api.Dtos;

public record CreateCollectionRequest(string Name, Guid OwnerId);