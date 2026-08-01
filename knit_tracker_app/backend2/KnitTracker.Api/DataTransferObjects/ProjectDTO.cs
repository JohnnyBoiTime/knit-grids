namespace KnitTracker.Api.DataTransferObjects;

// For the needles.
public record NeedleDto(string Type, string Size);

// For the yarn.
public record YarnDto(string Material, string Weight, string Yardage);

// Information for the project we want to save into the database.
public record ProjectsFromDatabase(
    string ProjectId,
    string NameOfProject,
    int Stitches,
    NeedleDto Needles,
    YarnDto Yarn,
    string[][] ProgressGrid,
    string Notes,
    string[] RowNotes,
    string Autofill,
    bool Complete
);

public record SaveProjectToDatabase(
    string ProjectId, // Need to determine which one we are saving/updating.
    string NameOfProject,
    int Stitches,
    NeedleDto Needles,
    YarnDto Yarn,
    string[][] ProgressGrid,
    string Notes,
    string[] RowNotes,
    string Autofill,
    bool Complete
);

public record DeleteProject(
    Guid ProjectId
);
