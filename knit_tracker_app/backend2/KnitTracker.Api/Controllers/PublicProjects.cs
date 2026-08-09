/*
using KnitTracker.Api.Data;
using System.Text.Json;
using KnitTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KnitTracker.Api.DataTransferObjects;

namespace KnitTracker.Api.Controllers;

// The publicly available projects.
[ApiController]
[Route("/api/publicProjects")]
public class PublicProjects : ControllerBase
{
    private readonly AppDbContext _context;

    private readonly UserManager<KnitTrackerUser> _userManager;

    // Turn C# into JSON fields to save/update database projects.
   private void CommunityProjectSubmission(ProjectsDatabaseFormat request, KnittingProject project)
    {
        project.NameOfProject = request.NameOfProject;

        project.Stitches = request.Stitches;

        project.Needles = JsonSerializer.Serialize(request.Needles);

        project.Yarn = JsonSerializer.Serialize(request.Yarn);

        project.ProgressGrid = JsonSerializer.Serialize(request.ProgressGrid);

        project.Notes = request.Notes;

        project.RowNotes = JsonSerializer.Serialize(request.RowNotes);

        project.Autofill = request.Autofill;

        project.Completed = request.Complete;
    }   

    // Public project constructor.
    private PublicProjects(AppDbContext context, UserManager<KnitTrackerUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }


    // Sending a project to the community database.
    [HttpPost]
    [Authorize]
    public Task<IActionResult> SubmitProjctToCommunity(ProjectsDatabaseFormat project)
    {
        var user = _userManager.GetUserId(User);

        var submitProject = 
    }

    
}


*/