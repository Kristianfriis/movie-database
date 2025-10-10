using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Movie.Database.Api.Persistence.Entities;

[Table("movies")]
public class MovieEntity : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("title")]
    public string? Title { get; set; }

    [Column("release_year")]
    public int? ReleaseYear { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
