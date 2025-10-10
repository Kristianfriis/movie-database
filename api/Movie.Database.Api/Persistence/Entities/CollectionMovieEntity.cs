using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Movie.Database.Api.Persistence.Entities;

[Table("collection_movies")]
public class CollectionMovieEntity : BaseModel
{
    [PrimaryKey("collection_id", false)]
    public Guid CollectionId { get; set; }

    [PrimaryKey("movie_id", false)]
    public Guid MovieId { get; set; }

    [Column("added_at")]
    public DateTime AddedAt { get; set; }
}
