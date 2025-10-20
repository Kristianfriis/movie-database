using System;
using Microsoft.Extensions.Options;
using Movie.Database.Api.External.translator;
using NSubstitute;

namespace Movie.Database.Api.Tests.External;

public class GeminiClientTests
{
    [Test]
    public async Task TranslateTest()
    {
        var testSettings = new GeminiOptions
        {
            Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            //Key = "test_api_key_123"
            Key = "< key here >"
        };

        var mockOptions = Substitute.For<IOptions<GeminiOptions>>();

        mockOptions.Value.Returns(testSettings);
       
        var client = new GeminiClient(mockOptions);

        var textToTranslate = "A black comedy featuring two butchers, Svend 'Sweat' and Bjarne, who start their own shop to get away from their arrogant boss. Cannibalism is soon introduced to the plot, and further complications arise due to the reappearance of Bjarne's intellectually disabled twin brother Eigil.";
        var targetLanguage = "danish";

        var result = await client.Translate(textToTranslate, targetLanguage);

        Assert.That(result.success, Is.True);
    }
}   
