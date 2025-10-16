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

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("format")]
    public string Format { get; set; } = default!;

    [Column("genres")]
    public string Genres { get; set; } = default!;
    
    [Column("poster_url")]
    public string? PosterUrl { get; set; }
    
    [Column("overview")]
    public string? Overview { get; set; }
}
