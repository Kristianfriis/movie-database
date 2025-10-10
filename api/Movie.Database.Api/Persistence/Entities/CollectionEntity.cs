using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Movie.Database.Api.Persistence.Entities;

[Table("collections")]
public class CollectionEntity : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string? Name { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}