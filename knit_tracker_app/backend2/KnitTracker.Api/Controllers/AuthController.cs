using KnitTracker.Api.Data;
using KnitTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace KnitTracker.Api.Controllers;

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

public record DeleteAccountRequest(
    string Password
);

// Class for logging in and registering.
[ApiController]
[Route("api")]
public class AuthController : ControllerBase
{
    private readonly UserManager<KnitTrackerUser> _userManager;
    private readonly SignInManager<KnitTrackerUser> _signInManager;

    public AuthController(UserManager<KnitTrackerUser> userManager, SignInManager<KnitTrackerUser> signInManager)
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
        var user = new KnitTrackerUser { UserName = request.Username, Email = request.Email };

        var result = await _userManager.CreateAsync(user, request.Password);

        // Could not create the user
        if (!result.Succeeded)
        {

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

    // Deletes the user's account and their projects.
    [Authorize]
    [HttpDelete("deleteAccount")]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest request)
    {
        var user = await _userManager.GetUserAsync(User);
        
        // User is not found.
        if (user is null)
        {
            return NotFound();
        }

        // User must enter their password to confirm deletion. This is to hopefully ensure
        // user is absolutely ready to delete their account.
        var confirmPassword = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!confirmPassword)
        {
            return BadRequest(new
            {
                detail = "Password is incorrect."
            });
        }

        await _userManager.DeleteAsync(user);

        return Ok(new
        {
            message = "Your account has been deleted"
        });

    }

    // Checks if user is authenticated to determine
    // if they can view certain pages.
    [HttpGet("currentAuthStatus")]
    [AllowAnonymous] // Can be logged in or not logged in
    public IActionResult GetAuthStatus()
    {

        bool isAuthenticated = User.Identity?.IsAuthenticated == true;

        return Ok( new
        {
            authenticated = isAuthenticated,
        });
    }
}