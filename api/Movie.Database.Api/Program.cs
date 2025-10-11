using System.Security.Claims;
using Scalar.AspNetCore;
using Microsoft.IdentityModel.Tokens;
using Supabase.Core;
using Supabase;
using Movie.Database.Api.Persistence;
using Movie.Database.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Movie.Database.Api.Extentions;
using Movie.Database.Api.Models;
using Movie.Database.Api.Endpoints;
using Movie.Database.Api.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var bytes = System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!);

builder.Services.AddAuthentication().AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            IssuerSigningKey = new SymmetricSecurityKey(bytes),
            ValidateIssuer = false
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.ConfigureHttpJsonOptions(opts => {
    opts.SerializerOptions.IncludeFields = true;
    opts.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddScoped<Client>(sp =>
{
    var url = builder.Configuration["Supabase:Url"]!;
    var key = builder.Configuration["Supabase:Key"]!;
    return new Client(url, key,
    new SupabaseOptions
    {
        AutoConnectRealtime = true,
        AutoRefreshToken = true,
    });
});

builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<IMovieRepository, SupabaseMovieRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.MapOpenApi();
app.MapScalarApiReference();

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.MapAuthEndpoints();
app.MapMovieEndpoints();

app.Run();