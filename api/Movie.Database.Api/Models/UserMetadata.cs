using System;

namespace Movie.Database.Api.Models;

public record UserMetadata(string email, bool email_verified, bool phone_verified, string sub);