using Movie.Database.Api.Models;

namespace Movie.Database.Api.Interfaces;

public interface IPersonRepository
{
    Task<List<Person>> SearchPeopleAsync(string query);
}