using System.ComponentModel;
using System.Reflection;

namespace Movie.Database.Api.Extentions;

public static class EnumHelper
{
    public static TEnum? GetEnumValueFromDescription<TEnum>(string description) where TEnum : struct, Enum
    {
        foreach (var field in typeof(TEnum).GetFields())
        {
            var attr = field.GetCustomAttribute<DescriptionAttribute>();
            if (attr?.Description == description)
            {
                return (TEnum)field.GetValue(null)!;
            }
        }

        return null;
    }

    public static string? GetDescription<TEnum>(TEnum value) where TEnum : Enum
    {
        var field = typeof(TEnum).GetField(value.ToString());
        var attr = field?.GetCustomAttribute<DescriptionAttribute>();
        return attr?.Description;
    }

    public static string? GetDescription(this Enum value)
    {
        var field = value.GetType().GetField(value.ToString());
        var attr = field?.GetCustomAttribute<DescriptionAttribute>();
        return attr?.Description;
    }
}