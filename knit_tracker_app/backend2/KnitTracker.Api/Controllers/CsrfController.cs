using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;

namespace KnitTracker.Api.Controllers;

// For CSRF token.
[ApiController]
[Route("api/csrf/")]
public class CsrfController : ControllerBase
{
    private readonly IAntiforgery _antiforgery;

    public CsrfController(IAntiforgery antiforgery)
    {
        _antiforgery = antiforgery;
    }

    // Get the CSRF token.
    [HttpGet]
    public IActionResult GetToken()
    {
        var token = _antiforgery.GetAndStoreTokens(HttpContext);

        return Ok(new
        {
            csrfToken = token.RequestToken
        });
    }
}