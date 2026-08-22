using KnitTracker.Api.Services;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

public class ResetEmailService : IResetEmailService
{
    private readonly IConfiguration _configuration;

    public ResetEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetPasswordUrl)
    {
        var resetPasswordEmail = new MimeMessage();

        // Sender
        resetPasswordEmail.From.Add(new
            MailboxAddress(
                "KnitTracker",
                _configuration["Email:Username"]
            )
        );

        resetPasswordEmail.To.Add(
            MailboxAddress.Parse(email)
        );

        resetPasswordEmail.Subject = "[KnitGrids] RESET PASSWORD REQUEST";

        resetPasswordEmail.Body = new TextPart("html")
        {
            Text = $"""
                <h2>Reset your password</h2>

                <p>
                    Click below to reset your KnitTracker password.
                </p>

                <p>
                    <a href="{resetPasswordUrl}">
                        Reset Password
                    </a>
                </p>

                <p>
                    If you didn't request this, ignore.
                </p>
                """
        };

          using var smtp = new SmtpClient();

        await smtp.ConnectAsync(
            "smtp.gmail.com",
            587,
            SecureSocketOptions.StartTls
        );

        await smtp.AuthenticateAsync(
            _configuration["Email:Username"],
            _configuration["Email:Password"]
        );

        await smtp.SendAsync(resetPasswordEmail);

        await smtp.DisconnectAsync(true);
    }
}