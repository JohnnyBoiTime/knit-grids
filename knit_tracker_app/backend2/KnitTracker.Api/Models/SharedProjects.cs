using System.ComponentModel.DataAnnotations;

namespace KnitTracker.Api.Models;

// This will be the table where users can share their patterns
// with others. 
public class SharedProjects
{
    public KnitTrackerUser? User { get; set; }

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
}