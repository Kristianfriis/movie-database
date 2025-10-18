using Movie.Database.Api.Models;

namespace Movie.Database.Api.Interfaces;

public interface IPersonRepository
{
    Task<List<Person>> SearchPeopleAsync(string query);
    Task<Person> CreatePerson(Person person);
    Task<List<Person>> CreatePersons(List<Person> persons);
    Task<Person> UpdatePerson(Person person);
}