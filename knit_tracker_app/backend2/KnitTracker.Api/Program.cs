using KnitTracker.Api.Data;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using KnitTracker.Api.Models;

// Create the configurer.
var builder = WebApplication.CreateBuilder(args);

// For failed requests and JSON error responses.
builder.Services.AddProblemDetails();

// Ensures that the POST and PUT requests ar required to have
// CSRF tokens by default.
builder.Services.AddControllersWithViews( options =>
{
    options.Filters.Add(
        new AutoValidateAntiforgeryTokenAttribute()
    );
});

// Use connection string from setup json.
var connectionString =
    builder.Configuration.GetConnectionString(
        "DefaultConnection"
    )
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' is missing."
    );

// Configures the database to use PostgreSQL and connection string.
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// Persist important data in database to be re-used between container deployments or restarts.
// Stuff like CSRF tokens and auth cookies.
builder.Services.AddDataProtection()
    .SetApplicationName("KnitTracker")
    .PersistKeysToDbContext<AppDbContext>();

// Configures user stuff for user creations, passwords, things related
// to users. Connects KnitTrackerUser to the identity tables in database.
builder.Services
    .AddIdentity<KnitTrackerUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>() // 
    .AddDefaultTokenProviders(); // Tokens for password resets and emails, to be implemented later.

// Configure the authentication cookie. Verifies who is making the request.
// Ensures the request belongs to an authenticated user.
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "knittracker-auth"; // Browser cookie name

    options.Cookie.HttpOnly = true; // Client-side JavasScript cannot access the cookie.

    options.Cookie.Path = "/"; // Allows cookie to be sent to all routes.

    // For development
    if (builder.Environment.IsDevelopment())
    {
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    }

    // For production
    else
    {
        options.Cookie.SameSite = SameSiteMode.None; // Allow cross site cookies
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Use HTTPS for cookies in prod.
    }

});

// CSRF token configuration. Ensures requests are coming
// from the front end.
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRFToken"; // Header for CSRF tokens.

    options.Cookie.Name = "knittracker-csrf";
    options.Cookie.HttpOnly = true;
    options.Cookie.Path = "/";


    // For development, lax security.
    if (builder.Environment.IsDevelopment())
    {
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    }

    // For production, ensure https and crosss site.
    else
    {
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    }
});

// Allow requests to be accepted from the vercel front end or any other
// front end that is specified.
var frontendOrigins =
    builder.Configuration
        .GetSection("Frontend:AllowedOrigins")
        .Get<string[]>()
    ?? throw new InvalidOperationException(
        "Frontend:AllowedOrigins is missing."
    );

// Cross origin reference security configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("NextFrontend", policy =>
    {
        policy
           // .WithOrigins("http://localhost:3000")
            .WithOrigins(frontendOrigins) // Specified front end origins
            .AllowAnyHeader() // Have headers for each request
            .AllowAnyMethod() // Allow GET, POST, DELETE http methods
            .AllowCredentials(); // Include the auth cookie in each request
    });
});

// For HTTP Strict Transport Security.
// Configures HSTS.
builder.Services.AddHsts(options =>
{
    // Keep it for 1 day.
    options.MaxAge = TimeSpan.FromDays(1);
});


/*
    APP SECTION
*/

// Create the application using the above configuration.
var app = builder.Build();

// Middleware for errors or exceptions.

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
// Also, handle exceptions using generic errors.
else
{
    app.UseExceptionHandler();
    app.UseHsts();
}

// Match requests from front end to matching endpoint in backend.
app.UseRouting();

app.UseCors("NextFrontend"); // Uses the CORS policy configured earlier

// Deteermines who the user is and what they can do
app.UseAuthentication(); // Who are you???
app.UseAuthorization(); // Here is what you can do!

// Map attributes to the endpoints (like [HttpGet], [HttpPost], etc.) to the controllers.
app.MapControllers();

// Start app.
app.Run();



