using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Moq;
using KnitTracker.Api.Controllers;
using KnitTracker.Api.Models;
using KnitTracker.Api.DataTransferObjects;


namespace KnitTracker.Api.Tests;

public class AuthTesting
{
    [Fact]
    public void PasswordResetTest()
    {
        var user = new Mock<IUserStore<KnitTrackerUser>>();
    }
}
