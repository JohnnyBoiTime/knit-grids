using KnitTracker.Api.Data;
using System.Text.Json;
using KnitTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KnitTracker.Api.DataTransferObjects;

namespace KnitTracker.Api.Controllers;

// ControllerBase contains the API methods for handling requests and responses.
[ApiController]
[Route("api/userProjects/")]
public class UserProjectsController : ControllerBase
{

    private readonly AppDbContext _context;
    private readonly UserManager<KnitTrackerUser> _userManager;

   // Converts JSON information from the database to a C# object to be able to send to Next.js due to
   // the ControllerBase methods converting C# objects to JSON's.
   private ProjectsDatabaseFormat ProjectInfoFromDatabase(KnittingProject project)
    {
        var needles = JsonSerializer.Deserialize<NeedleDto>(project.Needles) ?? new NeedleDto("", "");

        var yarn = JsonSerializer.Deserialize<YarnDto>(project.Yarn) ?? new YarnDto("", "", "");

        var progressGrid = JsonSerializer.Deserialize<string[][]>(project.ProgressGrid) ?? [];

        var rowNotes = JsonSerializer.Deserialize<string[]>(project.RowNotes) ?? [];

        return new ProjectsDatabaseFormat(
            ProjectId: project.ProjectId.ToString(),
            NameOfProject: project.NameOfProject,
            Stitches: project.Stitches,
            Needles: needles,
            Yarn: yarn,
            ProgressGrid: progressGrid,
            Notes: project.Notes,
            RowNotes: rowNotes,
            Autofill: project.Autofill,
            Complete: project.Completed
        );
    }    

    // Turn C# into JSON fields to save/update database projects.
   private void UpdateDatabaseProjects(ProjectsDatabaseFormat request, KnittingProject project)
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

    // Inject the database context and user manager services to the controller.
    public UserProjectsController(AppDbContext context, UserManager<KnitTrackerUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }


    // Gets all of the users projects
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var userId = _userManager.GetUserId(User);

        // Find users projects and order them by last updated.
        var projects = await _context.KnittingProjects
            .Where(project => project.UserId == userId)
            .OrderByDescending(project => project.UpdatedAt)
            .ToListAsync();

        // Change the format to JSON to send back to Next.js
        var response = projects.Select(ProjectInfoFromDatabase).ToList();

        return Ok(response);

    }

    // Save the newly created project to the database.
    // Project ID must be blank.
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> SaveProject(ProjectsDatabaseFormat request)
    {
        var userId = _userManager.GetUserId(User);

        // Invalid user!
        if (userId is null)
        {
            return Unauthorized();
        }

        var currentTime = DateTimeOffset.UtcNow;

        // A new project is being created.
        KnittingProject knittingProject = new KnittingProject
        {
            ProjectId = Guid.NewGuid(),
            UserId = userId,
            NameOfProject = request.NameOfProject,
            Stitches = request.Stitches,
            CreatedAt = currentTime
        };

        _context.KnittingProjects.Add(knittingProject);
        
        await _context.SaveChangesAsync();

        // Send back the new saved info from the database. 
        // Ok turns C# into JSON, so need to convert 
        // query back into C# for safer serialization.
        return Ok(ProjectInfoFromDatabase(knittingProject));
    } 

    // Put request for updating an existing projectin the datbaase.
    [Authorize]
    [HttpPut]
    public async Task<IActionResult> UpdateProject(ProjectsDatabaseFormat request)
    {

        var userId = _userManager.GetUserId(User);

        // The project ID of what is being saved isnt good.
        if (!Guid.TryParse(request.ProjectId, out var projectId))
        {
            return BadRequest( new
            {
                detail = "Invalid project ID!"
            });
        }

        // Search for the project. 
        var existingProject = await _context.KnittingProjects
            .SingleOrDefaultAsync(existingProject => 
                existingProject.ProjectId == projectId &&
                existingProject.UserId == userId 
            );


        // Make sure the project exists.
        if (existingProject is null)
            {
                return NotFound( new
                {
                    detail = "Project cannot be found!"
                });
            }

        // Turn the project back into a json to save back into the database.
        UpdateDatabaseProjects(request, existingProject);

        await _context.SaveChangesAsync();

        // Turn the info back to C# to send to front end.
        return Ok(ProjectInfoFromDatabase(existingProject));

    }

/*
    // Get the total number of stitches that the user has knitted
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetTotalSitches()
    {
        var userId = _userManager.GetUserId(User);

        var totalStitches = await _context.KnittingProjects
            .Where(project => project.UserId == userId)
            .Select(projects => projects.Stitches)
            .SumAsync();

        return Ok(new
        {
            numStitches = "Total stitches" + totalStitches
        });
    }

    */

    // Delete the project
    [Authorize]
    [HttpDelete] // Attributes: Tells compiler how to treat these
    public async Task<IActionResult> DeleteProject([FromBody] DeleteProject request)
    {

        var userId = _userManager.GetUserId(User);

        // Invalid user!
        if (userId is null)
        {

            return Unauthorized();
        }

        var projectToDelete = await _context.KnittingProjects
            .SingleOrDefaultAsync(existing => 
            existing.ProjectId == request.ProjectId && 
            existing.UserId == userId
            );

        if (projectToDelete is null)
        {

            return NotFound( new
            {
                detail = "Requested project to delete was not found!"
            });
        }

        _context.KnittingProjects.Remove(projectToDelete);

        // Does the changes/commits to the delete.
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Project" + projectToDelete.NameOfProject + "was deleted"
        });
    }
}






