import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// Information to send to database to store
// users knitting project
type KnitProjectFormat = {
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

// Used to display info on saved projects page,
// to provide an overview of the project
type retrievedKnitInfo = {
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
    
}
