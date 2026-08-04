namespace KnitTracker.Api.DataTransferObjects;

// Mad the needle and yarn into own DTO to keep
// their information together.

// For the needles.
public record NeedleDto(string Type, string Size);

// For the yarn.
public record YarnDto(string Material, string Weight, string Yardage);

// Information for the project we want to save into the database.
public record ProjectsDatabaseFormat(
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

public record DeleteProject(
    Guid ProjectId
);
