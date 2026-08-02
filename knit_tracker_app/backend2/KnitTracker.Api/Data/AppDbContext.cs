using KnitTracker.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace KnitTracker.Api.Data;

// Inherits from IdentityDbContext for database functionality. Sets up the structure of our database.
public class AppDbContext : IdentityDbContext<ApplicationUser>, IDataProtectionKeyContext
{

    // Constructor containing the database configuration.
    public AppDbContext (DbContextOptions<AppDbContext> options) : base(options)
    {
        
    }

    // Database table of knitting projects. 
    public DbSet<KnittingProject> KnittingProjects => Set<KnittingProject>();

    // Stores important tokens to be re-used later to avoid resetting tokens
    // after restarts or deployments.
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();


    // Configuration of the database, describes what the tables should look like.
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Makes it so the project's id is the primary key for identifying
        // the specific project.
        builder.Entity<KnittingProject>().HasKey(project => project.ProjectId);

        // One user can have many projects.
        builder.Entity<KnittingProject>()
            .HasOne(project => project.User)
            .WithMany()
            .HasForeignKey(project => project.UserId) // The projects userId points to the user in the user database
            .OnDelete(DeleteBehavior.Cascade); // Delete all knitting projects for the user

        // User will most likely keep accessing the most recent project to complete it,
        // so show most recently updated first. 
        builder.Entity<KnittingProject>()
            .HasIndex(project => new
            {
                project.UserId,
                project.UpdatedAt
            });
    }

}