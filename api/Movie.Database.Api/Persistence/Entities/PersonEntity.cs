using System;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Movie.Database.Api.Persistence.Entities;

[Table("persons")]
public class PersonEntity : BaseModel
{
    [PrimaryKey("id")]
    public long Id { get; set; }
    [Column("name")]
    public string? Name { get; set; }
    [Column("external_id")]
    public long ExternalId { get; set; }
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
