'use client';

import React, { useState, useEffect } from "react";
import knitGrid from "./KnittingGrid.module.css"
import {setNameOfProject, setStitches, setNeedleType, setNeedleSize, setYarnMaterial, setYarnWeight, setYarnYardage, setProgressGrid, reformatGrid, clearGrid} from "../redux/slices/knittingProjectSlice"
import {useDispatch} from "react-redux"
import {AppDispatch } from "../redux/store";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

type Stitches = string

// Amount of cast on stitches to start project
type KnittingGridProps = {
    stitches: number
    nameOfProject: string
}

// Info for needles
interface needles {
    type: string
    size: number
}
// Info for yarn
interface yarn {
    material: string
    weight: number
    yardage: number
}

// Begins the project. first row is the cast ons,
// has second row to initialize the grid itself.
function createKnitProject(stitches: number, rows: number): Stitches[][] {
    return Array.from({ length: rows }, 
        () => Array.from({length: stitches}, () => ""))
}

/* The grid to store a persons knitting project progress/information */
// stitches refers to the amount of cast-on stitches to start the project
export default function KnittingProject({stitches, nameOfProject} : KnittingGridProps) {

    // Before the states so we can set the default color to yellow
    const knittingProject = useSelector((state: RootState) => state.knittingProject)

    const [selectedStitches, setSelectedStitches] = useState<Set<string>>(new Set())
    const [selectedNeedles, setSelectedNeedless] = useState<needles>()
    const [currentPosition, setCurrentPosition] = useState<string>(`${stitches},20`)
    const [selectedYarn, setSelectedYarn] = useState<yarn>()
    const [color, setColor] = useState<string>("yellow")
    const [startSelecting, setStartSelecting] = useState<boolean>(false)
    const [knittingGrid, setKnittingGrid] = useState<Stitches[][]>(() => createKnitProject(stitches, 20)) // Creates the grid
    const [projectName, setProjectName] = useState<string>(() => nameOfProject) // Change project name

    const dispatch = useDispatch<AppDispatch>();

    
    useEffect(() => {

        // Create grid when starting a new project
        if (knittingProject.progressGrid.length === 0) {

            const startingArray = Array.from({length: 20}, 
                () => Array.from({length: stitches}, () => ",")
            )
            dispatch(reformatGrid(startingArray))
        }

    }, [])

    // Updates the stitch at it's given row and column
    function updateIndividualStitch(stitchRow: number, stitchCol: number, stitchType: Stitches) {

        /*
        setKnittingGrid(prevKnitGrid => {
            const updatedKnitGrid = prevKnitGrid.map((row, stitch) => {
                
                // Person does not want to change this row
                if (stitch !== stitchRow) {
                    return row
                }
                
                // This is where they want to update the stitch
                return row.map((stitch, col) => {
                    if (col != stitchCol) {
                        return stitch
                    }

                    return stitchType
                })
            })

            // Return the progress on the project!
            return updatedKnitGrid
        })
            */

        // Only replace the stitch itself since here , we are typing the stitch type into the entry
        const stitchInfo = knittingProject.progressGrid[stitchRow][stitchCol].replace(knittingProject.progressGrid[stitchRow][stitchCol].split(',')[0], stitchType)

        dispatch(setProgressGrid({stitchRow: stitchRow, col: stitchCol, stitchInfo: stitchInfo}))

    }

    // User can select multiple stitches to go back if they want to,
    // edit a row, etc.
    function selectMultipleStitches(stitchRow: number, column: number) {

        if (startSelecting == true) {
            // We will create a key from the row + column
            // since that creates a unique value for each stitch
            const key = stitchRow.toString() + "," + column.toString()

            // Select the new stitches
            setSelectedStitches(previousSelected => {
                const newlySelectedStitches = new Set(previousSelected)
                newlySelectedStitches.add(key)
                return newlySelectedStitches
            })

            const updateStitches = knittingProject.progressGrid[stitchRow][column].split(',')[0] + "," + color

            dispatch(setProgressGrid({stitchRow: stitchRow, col: column, stitchInfo: updateStitches}))
        }
           
    }

    function changeColorOfSelectedStitches(color: string) {
        selectedStitches.forEach(stitch => {
            const stitchRow = Number(stitch.split(',')[0])
            const stitchCol = Number(stitch.split(',')[1])

            // Just changing the color, so keep the old value
            const stitchInfo = knittingProject.progressGrid[stitchRow][stitchCol].split(',')[0] + "," + color
            setColor(color)
            
            dispatch(setProgressGrid({stitchRow: stitchRow, col: stitchCol, stitchInfo: stitchInfo}))

        })

    }

    // The users project information
    return  (
        // The grid to store a persons knitting project progress/info
        <div>
            <div>
            <div className={knitGrid.projectHeaders}>
                <p>Knitting project: {projectName}</p>
            </div >
            <div className={knitGrid.needles}>
                <p> Needles: </p>
                <input className={knitGrid.needleInfo} value={knittingProject?.needles.type} onChange={(e) => dispatch(setNeedleType(e.target.value))}/>
                <p> Size: </p>
                <input className={knitGrid.needleInfo} value={knittingProject?.needles.size} onChange={(e) => dispatch(setNeedleSize(e.target.value))}/>
            </div>
            <div className={knitGrid.yarn}>
                <p> Material: </p>
                <input className={knitGrid.yarnInfo} value={knittingProject?.yarn.material} onChange={(e) => dispatch(setYarnMaterial(e.target.value))}/>
                <p> Weight: </p>
                <input className={knitGrid.yarnInfo} value={knittingProject?.yarn.weight} onChange={(e) => dispatch(setYarnWeight(e.target.value))}/>
                <p> Yardage: </p>
                <input className={knitGrid.yarnInfo} value={knittingProject?.yarn.yardage} onChange={(e) => dispatch(setYarnYardage(e.target.value))}/>
                 <p className="ml-15" >More row info</p>
            </div>            
            </div>
            <table>
                <tbody>
                    {knittingProject.progressGrid.map((row, rowNumber) => (
                        <tr key={rowNumber} className={knitGrid.stitchRowLayout}>
                            {/* Set a fixed width and height for row numbers, formatting breaks with numbers > 1000 */}
                            <th className="w-8 h-6">{1 + rowNumber++}</th>
                            {row.map((stitch, colIndex) => (
                            <td className={knittingProject.progressGrid[rowNumber - 1][colIndex].split(',')[1] != "" ? knitGrid.stitchSelected : knitGrid.stitch} 
                            style={{backgroundColor: knittingProject.progressGrid[rowNumber - 1][colIndex].split(',')[1] != "" ?  stitch.split(',')[1] : undefined}}
                            key={colIndex} 
                            onMouseDown={() => setStartSelecting(true)}
                            onMouseUp={() => setStartSelecting(false)}
                            onKeyDown={(event) => {
                                // Cancel the selection
                                if (event.key === "Escape") {
                                    setSelectedStitches(new Set())
                                }

                                if (event.key === "Delete") {
                                    dispatch(clearGrid())
                                }
                                
                                // Go to currently selected row
                                if (event.key === "Enter") {
                                    // User wants to go back a row, make sure they really want to and it was not a misclick!
                                    if (rowNumber < Number(currentPosition?.substring(0, currentPosition.indexOf(',')))) {
                                        const confirmation = confirm(`Are you sure you want to go to row: ${rowNumber}`)
                                        
                                        // Go to that row
                                        if (confirmation) {
                                           // setKnittingGrid(Array.from({ length: (rowNumber) }, () => Array.from({length: stitches}, () => "")))
                                            // dispatch(setProgressGrid(Array.from({ length: (rowNumber) }, () => Array.from({length: stitches}, () => ""))))
                                            // const updatedArray = Array.from({ length: (rowNumber) }, () => Array.from({length: stitches}, () => ""))

                                            // Updates the knitting grid while keeping the old grids values as to not overwrite them when
                                            // going back to a previous row in the project
                                            const updatedArray = Array.from({ length: rowNumber }, (_, rowIndex) => Array.from( { length: stitches }, 
                                                (_, colIndex) => knittingProject.progressGrid[rowIndex]?.[colIndex].split(',')[0] ?? ""));

                                            dispatch(reformatGrid(updatedArray))

                                            setCurrentPosition(`${rowNumber},${colIndex}`)
                                        }
                                        // Do nothing
                                        else {
                                        }
                                    }
                                    // Update the new position we are at!
                                    else {
                                        // setKnittingGrid(Array.from({ length: rowNumber + 1 }, () => Array.from({length: stitches}, () => "")))
                                        // dispatch(setProgressGrid(Array.from({ length: (rowNumber) }, () => Array.from({length: stitches}, () => ""))))
                                        //const updatedArray = Array.from({ length: (rowNumber + 1) }, () => Array.from({length: stitches}, () => "")
                                        
                                        // Updates the knitting grid while keeping the old grids values as to not overwrite them when
                                        // creating a new row. Skips the color since we do not want the name of the color in the entry
                                        const updatedArray = Array.from({ length: rowNumber + 1 }, (_, rowIndex) => Array.from( { length: stitches }, 
                                                (_, colIndex) => knittingProject.progressGrid[rowIndex]?.[colIndex].split(',')[0] ?? ""));
``
                                        dispatch(reformatGrid(updatedArray));
                                        //dispatch(reformatGrid(updatedArray))

                                        setCurrentPosition(`${rowNumber},${colIndex}`)
                                    }
                                }
                            }}
                            onMouseMove={() => selectMultipleStitches(rowNumber - 1, colIndex)}>
                                <input 
                                    className={knitGrid.stitchInput}
                                    value={stitch.split(',')[0]}
                                    onChange={(event) => updateIndividualStitch(rowNumber - 1, colIndex, event.target.value)}
                                />
                            </td>
                            ))}
                        <td>
                            <input className={knitGrid.additionalRowInfo}/>
                        </td>
                        </tr>
                    )
                    )}
                </tbody>
            </table>
            <div>
                <p>Additional project notes:</p>
                <textarea className={knitGrid.additionalProjectInfo}/> 
                <div className="flex">
                    <p> Highlight color: </p>
                    <input type="color" defaultValue={"#ffff00"} onChange={(event) => changeColorOfSelectedStitches(event.target.value)}></input>
                </div>        
            </div>
        </div>
    )
    
}