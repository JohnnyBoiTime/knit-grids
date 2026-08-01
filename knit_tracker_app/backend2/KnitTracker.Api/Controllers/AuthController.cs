using KnitTracker.Api.Data;
using KnitTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace KnitTracker.Api.Controllers;


// Class for logging in and registering.
[ApiController]
[Route("api")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    // Endpoint for registering
    [HttpPost("register")]
    public async Task<IActionResult> Register(Registration request)
    {
        var existingUser = await _userManager.FindByNameAsync(request.Username);

        Console.WriteLine(request);
        
        // The username is already registered in the system, so user must choose a different one
        if (existingUser is not null)
        {
            return BadRequest(new
            {
                detail = "Username already exists!"
            });
        }

        // Create a new user with the specified username and password
        var user = new ApplicationUser { UserName = request.Username, Email = request.Email };

        var result = await _userManager.CreateAsync(user, request.Password);

        // Could not create the user
        if (!result.Succeeded)
        {
             Console.WriteLine("FAILED!!!");

            return BadRequest(new

            // Json:
            {
                detail = "Registration failed!",
                errors = result.Errors.Select(error => error.Description)
            });
        }

        return StatusCode(201, new
        {
            detail = "Registration is successful!"
        });

    }

    // Endpoint for logging in
    [HttpPost("login")]
    public async Task<IActionResult> Login (Login request)
    {
        var result = await _signInManager.PasswordSignInAsync(
            request.Username,
            request.Password,
            isPersistent: request.RememberMe,
            lockoutOnFailure: true
            );

        if (!result.Succeeded)
        {
            return Unauthorized( new
            {
                detail = "Invalid username or password!"
            });
        }

        return Ok( new
        {
            detail = "Logged in!"
        });
    }

    // Log the user out.
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();

        return Ok ( new
        {
            detail = "Logout Success"
        });
    }

    // Checks if user is authenticated. This is for a quick
    // check for things like persistent logins and other things
    // rekated to autentication.
    [HttpGet("currentAuthStatus")]
    [Authorize]
    public IActionResult GetAuthStatus()
    {
        return Ok( new
        {
            authenticated = true,
        });
    }
}


// Registration information
public record Registration (
    string Username,
    string Email,
    string Password
);

// Login information
public record Login (
    string Username,
    string Password,
    bool RememberMe
);