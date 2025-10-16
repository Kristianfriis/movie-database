using System.ComponentModel.DataAnnotations;

namespace Movie.Database.Api.Models;

public enum Genre
{
    [Display(Name = "Unknown")]
    Unknown = 0,

    [Display(Name = "Action")]
    Action = 1,

    [Display(Name = "Adventure")]
    Adventure = 2,

    [Display(Name = "Animation")]
    Animation = 3,

    [Display(Name = "Comedy")]
    Comedy = 4,

    [Display(Name = "Crime")]
    Crime = 5,

    [Display(Name = "Documentary")]
    Documentary = 6,

    [Display(Name = "Drama")]
    Drama = 7,

    [Display(Name = "Family")]
    Family = 8,

    [Display(Name = "Fantasy")]
    Fantasy = 9,

    [Display(Name = "History")]
    History = 10,

    [Display(Name = "Horror")]
    Horror = 11,

    [Display(Name = "Music")]
    Music = 12,

    [Display(Name = "Mystery")]
    Mystery = 13,

    [Display(Name = "Romance")]
    Romance = 14,

    [Display(Name = "Science Fiction")]
    ScienceFiction = 15,

    [Display(Name = "TV Movie")]
    TVMovie = 16,

    [Display(Name = "Thriller")]
    Thriller = 17,

    [Display(Name = "War")]
    War = 18,

    [Display(Name = "Western")]
    Western = 19
}
