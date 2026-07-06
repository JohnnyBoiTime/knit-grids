import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Format of our knitting project information
interface KnittingProjectState{
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
    progressGrid: string[][]
    finished: boolean
}

const initialState: KnittingProjectState = {
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
    progressGrid: [],
    finished: false
}

// Store the information
const knittingProjectSlice = createSlice({
    name: "knittingProject",
    initialState,
    reducers: {
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
        setProgressGrid(state, action: PayloadAction<{stitchRow: number, col: number, stitchInfo: string}>) {
            const {stitchRow, col, stitchInfo} = action.payload

            state.progressGrid[stitchRow][col] = stitchInfo
        },
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

export const { setNameOfProject, setStitches, setNeedleType, setNeedleSize, setYarnMaterial, setYarnWeight, setYarnYardage, setProgressGrid, reformatGrid, clearGrid, finishedProject } = knittingProjectSlice.actions
export default knittingProjectSlice.reducer