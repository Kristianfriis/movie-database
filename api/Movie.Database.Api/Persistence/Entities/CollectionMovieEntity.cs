using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Movie.Database.Api.Persistence.Entities;

[Table("collection_movies")]
public class CollectionMovieEntity : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("collection_id")]
    public Guid CollectionId { get; set; }

    [Column("movie_id")]
    public Guid MovieId { get; set; }
    
    [Column("format")]
    public string Format { get; set; } = default!;
}
