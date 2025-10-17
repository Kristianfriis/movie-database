using System;
using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;
using Movie.Database.Api.Persistence.Entities;
using Supabase.Postgrest;

namespace Movie.Database.Api.Persistence;

public class PersonRepository : IPersonRepository
{
    private readonly Supabase.Client _client;

    public PersonRepository(Supabase.Client client)
    {
        _client = client;
    }

    public async Task<List<Person>> SearchPeopleAsync(string query)
    {
        var dbResult = await _client
            .From<PersonEntity>()
            .Filter("name", Constants.Operator.ILike, $"%{query}%")
            .Get();

        var result = new List<Person>();


        foreach (var person in dbResult.Models)
        {
            var mappedPerson = new Person
            {
                Id = person.Id,
                Name = person.Name,
                ExternalId = person.ExternalId
            };

            result.Add(mappedPerson);
        }

        return result;
    }

}
