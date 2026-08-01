using KnitTracker.Api.Data;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using KnitTracker.Api.Models;

// Create the configurer
var builder = WebApplication.CreateBuilder(args);

// For failed requests.
builder.Services.AddProblemDetails();

// Notifies ASP.NEXT about our controllers and ensures that each
// controller is validated correctly.
builder.Services.AddControllersWithViews( options =>
{
    options.Filters.Add(
        new AutoValidateAntiforgeryTokenAttribute()
    );
});

// Using supabase
var connectionString =
    builder.Configuration.GetConnectionString(
        "DefaultConnection"
    )
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' is missing."
    );

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// Persist important data in database to be re-used between container deployments or restarts.
builder.Services.AddDataProtection().SetApplicationName("KnitTracker").PersistKeysToDbContext<AppDbContext>();

// Configures user stuff
builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// Configure the authentication cookie
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "knittracker-auth";

    options.Cookie.HttpOnly = true;

    options.Cookie.Path = "/";

    // For development
    if (builder.Environment.IsDevelopment())
    {
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy =
            CookieSecurePolicy.SameAsRequest;
    }

    // For production
    else
    {
        options.Cookie.SameSite = SameSiteMode.None; // Allow cross site cookies
        options.Cookie.SecurePolicy =
            CookieSecurePolicy.Always;
    }

});

// CSRF token required.
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRFToken";

    options.Cookie.Name = "knittracker-csrf";
    options.Cookie.HttpOnly = true;
    options.Cookie.Path = "/";


    // For development.
    if (builder.Environment.IsDevelopment())
    {
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy =
            CookieSecurePolicy.SameAsRequest;
    }

    // For production.
    else
    {
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy =
            CookieSecurePolicy.Always;
    }
});

// Allow requests to be accepted from the vercel front end.
var frontendOrigins =
    builder.Configuration
        .GetSection("Frontend:AllowedOrigins")
        .Get<string[]>()
    ?? throw new InvalidOperationException(
        "Frontend:AllowedOrigins is missing."
    );

// Cross origin reference securuity configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("NextFrontend", policy =>
    {
        policy
           // .WithOrigins("http://localhost:3000")
            .WithOrigins(frontendOrigins) // NEXT.JS/VERCEL front end easy.
            .AllowAnyHeader() // Have headers for each request
            .AllowAnyMethod() // Allow GET, POST, PUT, DELETE http methods
            .AllowCredentials(); // Include the auth cookie in each request
    });
});

// For HTTP Strict-Transport Security.
// Configures HSTS.
builder.Services.AddHsts(options =>
{
    // Keep it for 1 day.
    options.MaxAge = TimeSpan.FromDays(1);
});


/*
    APP SECTION
*/

var app = builder.Build();

// Tell ASP.NET that every reuqest uses HTTPS,
// since google cloud run gaurantees https.
if (app.Environment.IsProduction())
{

    // Pass requests to other middlewares.
    app.Use((context, next) =>
    {
        context.Request.Scheme = "https";
        return next(context);
    });
}

// For development, just http
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// In production, tell browsers to use HTTPS for requests.
else
{
    app.UseExceptionHandler();
    app.UseHsts();
}

// Grab all the routes in the project to apply CORS to them.
app.UseRouting();

app.UseCors("NextFrontend"); // Uses the CORS policy configured earlier

// Deteermines who the user is and what they can do
app.UseAuthentication();
app.UseAuthorization();

// Map controller routes to endpoints
app.MapControllers();

app.Run();



