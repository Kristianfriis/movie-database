using System;
using Movie.Database.Api.Models;
using Movie.Database.Api.Persistence.Entities;

namespace Movie.Database.Api.Persistence.Mappers;

public static class PersonMapper
{
    public static Person MapToDomain(PersonEntity db)
    {
        var result = new Person
        {
            Id = db.Id,
            Name = db.Name,
            ExternalId = db.ExternalId
        };

        return result;
    }

    public static PersonEntity MapToEntity(Person person)
    {
        var result = new PersonEntity
        {
            Id = person.Id,
            Name = person.Name,
            ExternalId = person.ExternalId
        };

        return result;
    }
}
