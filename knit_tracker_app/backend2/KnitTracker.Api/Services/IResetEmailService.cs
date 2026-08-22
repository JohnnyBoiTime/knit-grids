namespace KnitTracker.Api.Services;

public interface IResetEmailService
{
    Task SendPasswordResetEmailAsync(
        string email,
        string resetPasswordUrl
    );
}