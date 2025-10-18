using System;
using Movie.Database.Api.Interfaces;
using Movie.Database.Api.Models;
using Movie.Database.Api.Persistence.Entities;
using Movie.Database.Api.Persistence.Mappers;
using Supabase.Postgrest;

namespace Movie.Database.Api.Persistence;

public class PersonRepository : IPersonRepository
{
    private readonly Supabase.Client _client;

    public PersonRepository(Supabase.Client client)
    {
        _client = client;
    }

    public async Task<Person> CreatePerson(Person person)
    {
        var existingPerson = await SearchPeopleAsync(person.Name ?? "");

        if (existingPerson.Any())
        {
            return existingPerson.First();
        }

        var newPerson = PersonMapper.MapToEntity(person);
        newPerson.CreatedAt = DateTime.UtcNow;

        var inserted = await _client.From<PersonEntity>().Insert(newPerson);

        if (inserted is null || inserted.Model is null)
            throw new Exception("Failed to insert person");

        return PersonMapper.MapToDomain(inserted.Model);
    }

    public async Task<List<Person>> CreatePersons(List<Person> persons)
    {
        var existingPersons = new List<Person>();

        foreach (var person in persons)
        {
            existingPersons.AddRange(await SearchPeopleAsync(person.Name ?? ""));
        }

        var personsToCreate = persons.Where(p => !existingPersons.Any(e => e.Name == p.Name)).ToList();

        if (personsToCreate.Any())
        {
            var inserted = await _client
                .From<PersonEntity>()
                .Insert(personsToCreate.Select(PersonMapper.MapToEntity).ToList());

            if (inserted is null)
                throw new Exception("Failed to insert persons");

            existingPersons.AddRange(inserted.Models.Select(PersonMapper.MapToDomain).ToList());
        }

        return existingPersons;
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
            var mappedPerson = PersonMapper.MapToDomain(person);
            result.Add(mappedPerson);
        }

        return result;
    }

    public async Task<Person> UpdatePerson(Person person)
    {
        var existing = await _client
            .From<PersonEntity>()
            .Where(p => p.Id == person.Id)
            .Single();

        if (existing is null)
            throw new Exception("Person not found");

        existing.Name = person.Name;    

        var updated = await _client.From<PersonEntity>().Update(existing);

        if (updated is null || updated.Model is null)
            throw new Exception("Failed to update person"); 

        return PersonMapper.MapToDomain(updated.Model);
    }
}
