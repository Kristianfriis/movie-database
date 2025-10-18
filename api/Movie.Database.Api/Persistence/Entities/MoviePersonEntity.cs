using System;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Movie.Database.Api.Persistence.Entities;

[Table("movie_persons")]
public class MoviePersonEntity : BaseModel
{
    [PrimaryKey("id")]
    public long Id { get; set; }
    [Column("movie_id")]
    public Guid MovieId { get; set; }
    [Column("person_id")]
    public long PersonId { get; set; }
    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("type")]
    public string? Type { get; set; }
}
