using System.Text;
using KnitTracker.Api.Data;
using KnitTracker.Api.Models;
using KnitTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
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

public record ForgotPassword (
    string Email
);

public record ResetPassword (
    string Email,
    string Token,
    string NewPassword
);

// Class for logging in and registering.
[ApiController]
[Route("api")]
public class AuthController : ControllerBase
{
    private readonly UserManager<KnitTrackerUser> _userManager;
    private readonly SignInManager<KnitTrackerUser> _signInManager;
    private readonly IResetEmailService _resetEmailService;

    public AuthController(UserManager<KnitTrackerUser> userManager, 
        SignInManager<KnitTrackerUser> signInManager,
        IResetEmailService resetEmailService 
        )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _resetEmailService = resetEmailService;
    }

    // Endpoint for registering
    [HttpPost("register")]
    public async Task<IActionResult> Register(Registration request)
    {
        var existingUsername = await _userManager.FindByNameAsync(request.Username);

        var existingEmail = await _userManager.FindByEmailAsync(request.Email);

        Console.WriteLine(request);
        
        // The username or email is already registered in the system.
        if (existingEmail is not null)
        {
            return BadRequest(new
            {
                detail = "Email already exists!"
            });
        }
        else if (existingUsername is not null)
        {
            return BadRequest(new
            {
                detail = "Username already exists!"
            });
        }
        else {

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

    // User has forgot their password, so start
    // password recovery process by sending
    // them a password reset via e-mail
    [HttpPost("forgotPassword")]
    public async Task<IActionResult> ForgotPasswordEmail(ForgotPassword req)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);

        // User wasnt found, this exists so
        // we exit if the email does not
        // exist in the database. Also so a user
        // cannot discover peoples emails registered.
        if (user is null)
        {
            return Ok(new
            {
                message = "An email has been sent to: " + req.Email
            });
        }

        // The valid password reset token, encoding the token, and sending the 
        // url to the use's email
        var passwordResetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        var encodeToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(passwordResetToken));

        var resetUrl =
           //$"https://knitgrids.vercel.app/reset-password" +
           $"http://localhost:3000/reset-password" +
            $"?email={Uri.EscapeDataString(req.Email)}" +
            $"&token={Uri.EscapeDataString(encodeToken)}";

        await _resetEmailService.SendPasswordResetEmailAsync(
            req.Email,
            resetUrl
        );

        return Ok(new {
            message = "An email has not been sent to: " + req.Email
        });
    }

    // Resets the users password.
    [HttpPost("resetPassword")]
    public async Task<IActionResult> ResetPassword(ResetPassword req)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);

        if (user is null)
        {
            return BadRequest( new
            {
                message = "Password reset req is invalid!"
            });
        }

        string token;

        try
        {
            var decodeToken = WebEncoders.Base64UrlDecode(req.Token);

            token = Encoding.UTF8.GetString(decodeToken); 
        } 
        catch
        {
            return BadRequest(new
            {
                message = "Invalid password reset token!"
            });
        }


        var result = await _userManager.ResetPasswordAsync(
            user,
            token,
            req.NewPassword
            );
        
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Password could not be successfully reset",
            });
        }

        return Ok(new
        {
            message = "Password has successfully been reset"
        });
    }
}