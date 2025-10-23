using System.ComponentModel;

namespace Movie.Database.Api.Models;

public enum Languages
{
    [Description("da-DK")]
    Danish,

    [Description("en-US")]
    English,

    [Description("es-ES")]
    Spanish,

    [Description("fr-FR")]
    French,

    [Description("de-DE")]
    German,

    [Description("it-IT")]
    Italian,

    [Description("nl-NL")]
    Dutch,

    [Description("no-NO")]
    Norwegian,

    [Description("pl-PL")]
    Polish,

    [Description("pt-PT")]
    Portuguese,

    [Description("ru-RU")]
    Russian,

    [Description("sv-SE")]
    Swedish,

    [Description("tr-TR")]
    Turkish,

    [Description("zh-CN")]
    Chinese,

    [Description("ja-JP")]
    Japanese
}
