using System;

namespace Movie.Database.Api.Dtos;

public class CreateMovieRequest
{
    public string Title { get; set; } = default!;
    public MovieFormatDto Format { get; set; } = MovieFormatDto.DVD;
    public Guid CollectionId { get; set; } = default!;
}

public enum MovieFormatDto
{
    DVD,
    BluRay,
    Digital
}
