using System.ComponentModel.DataAnnotations;

namespace Movie.Database.Api.External.MovieLookup.Models;

public enum GenreResponse
{
    [Display(Name = "Action")]
    Action = 28,

    [Display(Name = "Adventure")]
    Adventure = 12,

    [Display(Name = "Animation")]
    Animation = 16,

    [Display(Name = "Comedy")]
    Comedy = 35,

    [Display(Name = "Crime")]
    Crime = 80,

    [Display(Name = "Documentary")]
    Documentary = 99,

    [Display(Name = "Drama")]
    Drama = 18,

    [Display(Name = "Family")]
    Family = 10751,

    [Display(Name = "Fantasy")]
    Fantasy = 14,

    [Display(Name = "History")]
    History = 36,

    [Display(Name = "Horror")]
    Horror = 27,

    [Display(Name = "Music")]
    Music = 10402,

    [Display(Name = "Mystery")]
    Mystery = 9648,

    [Display(Name = "Romance")]
    Romance = 10749,

    [Display(Name = "Science Fiction")]
    ScienceFiction = 878,

    [Display(Name = "TV Movie")]
    TVMovie = 10770,

    [Display(Name = "Thriller")]
    Thriller = 53,

    [Display(Name = "War")]
    War = 10752,

    [Display(Name = "Western")]
    Western = 37
}
