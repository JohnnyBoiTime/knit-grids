using KnitTracker.Api.Data;
using System.Text.Json;
using KnitTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KnitTracker.Api.DataTransferObjects;

namespace KnitTracker.Api.Controllers;

[ApiController]
[Route("api/userProjects/")]
public class UserProjectsController : ControllerBase
{

    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    
   // Turn info from database into JSON to send to front end to display users
   // saved projects from the database
   private ProjectsFromDatabase ProjectInfoFromDatabase(KnittingProject project)
    {
        var needles = JsonSerializer.Deserialize<NeedleDto>(project.Needles) ?? new NeedleDto("", "");

        var yarn = JsonSerializer.Deserialize<YarnDto>(project.Yarn) ?? new YarnDto("", "", "");

        var progressGrid = JsonSerializer.Deserialize<string[][]>(project.ProgressGrid) ?? [];

        var rowNotes = JsonSerializer.Deserialize<string[]>(project.RowNotes) ?? [];

        return new ProjectsFromDatabase(
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
   private void UpdateDatabaseProjects(SaveProjectToDatabase request, KnittingProject project)
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

    public UserProjectsController(AppDbContext context, UserManager<ApplicationUser> userManager)
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

    // Save or graba single project from the database
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> SaveProject(SaveProjectToDatabase request)
    {
        var userId = _userManager.GetUserId(User);

        // Invalid user!
        if (userId is null)
        {
            return Unauthorized();
        }

        KnittingProject knittingProject;

        var currentTime = DateTimeOffset.UtcNow;

        // A new project is being created.
        if (request.ProjectId == "Blank")
        {
            knittingProject = new KnittingProject
            {
                ProjectId = Guid.NewGuid(),
                UserId = userId,
                NameOfProject = request.NameOfProject,
                CreatedAt = currentTime
            };

            _context.KnittingProjects.Add(knittingProject);
        }

        // Project id already exists so we are just updating the data that exists
        // in the database
        else
        {

            // The project ID of what is being saved isnt good.
            if (!Guid.TryParse(request.ProjectId, out var projectId))
            {
                return BadRequest( new
                {
                    detail = "Invalid project ID!"
                });
            }

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


            // It exists!
            knittingProject = existingProject;

        }

        UpdateDatabaseProjects(request, knittingProject);

        await _context.SaveChangesAsync();

        // Send back the new saved info from the database.
        return Ok(ProjectInfoFromDatabase(knittingProject));
    } 

    // Delete the project
    [Authorize]
    [HttpDelete]
    public async Task<IActionResult> DeleteProject([FromBody] DeleteProject request)
    {

         Console.Write("Here");
        var userId = _userManager.GetUserId(User);

       

        // Invalid user!
        if (userId is null)
        {

             Console.Write("Here1");
            return Unauthorized();
        }

        var projectToDelete = await _context.KnittingProjects
            .SingleOrDefaultAsync(existing => 
            existing.ProjectId == request.ProjectId && 
            existing.UserId == userId
            );

        if (projectToDelete is null)
        {

             Console.Write("Here2");
            return NotFound( new
            {
                detail = "Requested project to delete was not found!"
            });
        }

        _context.KnittingProjects.Remove(projectToDelete);

        // Does the changes
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Project" + projectToDelete.NameOfProject + "was deleted"
        });
    }
}






