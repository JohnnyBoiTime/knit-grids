import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Format of our knitting project information
interface KnittingProjectState{
    projectID: string
    nameOfProject: string
    stitches: number
    needles: {
        type: string
        size: string
    }
    yarn: {
        material: string
        weight: string
        yardage: string
    }
    notes: string
    rowNotes: string[]
    autofill: string
    progressGrid: string[][]
    finished: boolean
}

const initialState: KnittingProjectState = {
    projectID: "",
    nameOfProject: "",
    stitches: 0,
    needles: {
        type: "",
        size: ""
    },
    yarn: {
        material: "",
        weight: "",
        yardage: ""
    },
    notes: "",
    rowNotes: [],
    autofill: "",
    progressGrid: [],
    
    finished: false
}

// Changing the state
const knittingProjectSlice = createSlice({
    name: "knittingProject",
    initialState,
    reducers: {
        setProjectID(state, action: PayloadAction<string>) {
            state.projectID = action.payload
        },
        setNameOfProject(state, action: PayloadAction<string>) {
            state.nameOfProject = action.payload
        },
        setStitches(state, action: PayloadAction<number>) {
            state.stitches = action.payload
        },
        setNeedleType(state, action: PayloadAction<string>) {
            state.needles.type = action.payload
        },
        setNeedleSize(state, action: PayloadAction<string>) {
            state.needles.size = action.payload
        },
        setYarnMaterial(state, action: PayloadAction<string>) {
            state.yarn.material = action.payload
        },
        setYarnWeight(state, action: PayloadAction<string>) {
            state.yarn.weight = action.payload
        },
        setYarnYardage(state, action: PayloadAction<string>) {
            state.yarn.yardage = action.payload
        },

        // Used to set specific attributes of the grid.
        // NOTE: stitchInfo contains (separated by commas):
        // name of stitch (string), color (string), bold text (1 = bold, 0 = none)
        setProgressGrid(state, action: PayloadAction<{stitchRow: number, col: number, stitchInfo: string}>) {
            const {stitchRow, col, stitchInfo} = action.payload

            state.progressGrid[stitchRow][col] = stitchInfo
        },
        setProgressGridColors(state, action: PayloadAction<{stitchRow: number, stitchCol: number, stitchInfo: string}[]>) {
            action.payload.forEach((stitch) => {
                state.progressGrid[stitch.stitchRow][stitch.stitchCol] = stitch.stitchInfo
            })
        },
        setNotes(state, action: PayloadAction<string>) {
            state.notes = action.payload
        },
        setRowNotes(state, action: PayloadAction<string[]>) {
            state.rowNotes = action.payload
        },
        setAutofill(state, action: PayloadAction<string>) {
            state.autofill = action.payload
        },

        // This is different from setProgressGrid. Used to set/reformat the entire grid.
        // So, when retrieving information from the database, this is used.
        reformatGrid(state, action: PayloadAction<string[][]>) {
            state.progressGrid = action.payload
        },
        clearGrid(state) {
            state.progressGrid = [["blank,#ffff00"]]
        },
        finishedProject(state, action: PayloadAction<boolean>) {
            state.finished = action.payload
        }
    }
})

export const { setNameOfProject, setStitches, setNeedleType, setNeedleSize, setYarnMaterial, setYarnWeight, setYarnYardage, setProgressGrid, setNotes, setRowNotes, reformatGrid, clearGrid, finishedProject, setProjectID, setAutofill, setProgressGridColors } = knittingProjectSlice.actions
export default knittingProjectSlice.reducer