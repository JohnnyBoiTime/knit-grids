using KnitTracker.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace KnitTracker.Api.Data;

// Inherits from IdentityDbContext for database functionality. Sets up the structure of our database.
public class AppDbContext : IdentityDbContext<KnitTrackerUser>, IDataProtectionKeyContext
{

    // Pass the options up to IdentityDbContext and DataProtectionKeyContext,
    // handling the database connections and configurations or whatever
    // options they need.
    public AppDbContext (DbContextOptions<AppDbContext> options) : base(options)
    {
        // Nothing is needed, just need to pass information up.
    }

    // Database table of knitting projects. 
    public DbSet<KnittingProject> KnittingProjects => Set<KnittingProject>();

    // Stores important tokens to be re-used later to avoid resetting tokens
    // after restarts or deployments. Also good for remembering logins!
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();


    // Configuration of the database, describes what the tables should look like.
    protected override void OnModelCreating(ModelBuilder builder)
    {

        // Creates the ASP.NET identity tables. Most importantly, 
        // the AspNetUsers table which stores all of the users.
        base.OnModelCreating(builder);

        // Makes it so the project's id is the primary key for identifying
        // the specific project.
        builder.Entity<KnittingProject>().HasKey(project => project.ProjectId);

        // One user can have many projects.
        builder.Entity<KnittingProject>()
            .HasOne(project => project.User)
            .WithMany() // Explicitly make it one to many
            .HasForeignKey(project => project.UserId) // The projects userId points to the user in the user database
            .OnDelete(DeleteBehavior.Cascade); // Delete all knitting projects for the user

        // Users will constantly want to retrieve their
        // most recently updated project to continue working on it. 
        // So an index is created here.
        builder.Entity<KnittingProject>()
            .HasIndex(project => new
            {
                project.UserId,
                project.UpdatedAt
            });
    }

}