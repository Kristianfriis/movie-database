using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Movie.Database.Api.Persistence.Entities;

[Table("users")]
public class UserEntity : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = default!; // Supabase Auth UUID

    [Column("email")]
    public string Email { get; set; } = default!;

    [Column("name")]
    public string? Name { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("auth_id")]
    public string AuthId { get; set; } = default!;
}
