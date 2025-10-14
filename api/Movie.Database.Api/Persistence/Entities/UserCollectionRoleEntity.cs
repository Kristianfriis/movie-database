using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Movie.Database.Api.Persistence.Entities;


[Table("user_collection_roles")]
public class UserCollectionRoleEntity : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("collection_id")]
    public Guid CollectionId { get; set; }

    [Column("role")]
    public string? Role { get; set; } // "maintainer" or "reader"
}
