using System.ComponentModel.DataAnnotations;

namespace KnitTracker.Api.Models;

// The format of the users project that will be stored in the 
// database.
public class KnittingProject
{
    public Guid ProjectId { get; set; } = Guid.NewGuid();

    public required string UserId { get; set; }

    public ApplicationUser? User { get; set; }

    [MaxLength(50)]
    public required string NameOfProject { get; set; }

    public int Stitches { get; set; }

    // {} specifies it is a JSON.
    public string Needles { get; set; } = "{}";

    public string Yarn { get; set; } = "{}";

    // [] specifies it is an array.
    public string ProgressGrid{ get; set; } = "[]";

    public string Notes { get; set; } = "";

    public string RowNotes { get; set; } = "[]";

    public string Autofill { get; set; } = "[]";

    public bool Completed { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

}