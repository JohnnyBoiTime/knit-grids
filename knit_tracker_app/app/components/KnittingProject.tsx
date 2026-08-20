'use client';

import { useState, useEffect, useRef } from "react";
import knitGrid from "./KnittingGrid.module.css"
import {setNeedleType, setNeedleSize, setYarnMaterial, setYarnWeight, setYarnYardage, setProgressGrid, setProgressGridColors, reformatGrid, setNotes, setAutofill, clearGrid, setProjectID} from "../redux/slices/knittingProjectSlice"
import {useDispatch, useSelector} from "react-redux"
import {AppDispatch } from "../redux/store";
import { RootState } from "../redux/store";
import Link from "next/link";
import { useUpdateKnitingProjectMutation } from "../redux/slices/saveKnittingProjectSlice"
import {  CheckCircleIcon, CheckIcon, SaveCheck, X } from "lucide-react";

type Stitches = string

// Amount of cast on stitches to start project
interface KnittingGridProps {
    stitches: number
    nameOfProject: string
}

// Format of project we 
// send to the database
type KnitProjectFormat = {
    projectId: string
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

/* The grid to store a persons knitting project progress/information */
// stitches refers to the amount of cast-on stitches to start the project
export default function KnittingProject({stitches, nameOfProject} : KnittingGridProps) {

    // Before the states so we can set the default color to yellow
    const knittingProject = useSelector((state: RootState) => state.knittingProject)

    /*
    // Mutation for saving a project
    const [addKnittingProject , {isLoading: isSaving}] = useAddKnittingProjectMutation()

    */

    const [updateKnitProject , {isLoading: isUpdating}] = useUpdateKnitingProjectMutation()


    const [selectedStitches, setSelectedStitches] = useState<Set<string>>(new Set())
    const [toggleAutofill, setToggleAutofill] = useState(false)
    const [toggleHighlight, setToggleHghlight] = useState(true)
    const [hasSaved, setHasSaved] = useState(true)
    const [rowNotes, setRowNotes] = useState([""])
    const [currentPosition, setCurrentPosition] = useState<string>(`1,${stitches}`)
    const [color, setColor] = useState("yellow")
    const [positionOfTools, setPositionOfTools] = useState(1)
    const [startSelecting, setStartSelecting] = useState<boolean>(false)
    const [projectName, setProjectName] = useState<string>(() => nameOfProject) // Change project name

    const dispatch = useDispatch<AppDispatch>();

    // Stores ref to every HTML element, this is so 
    // the cursor is moved around the inputs when doing
    // things like autofill. The coordinates of the 
    // input is mapped to itself, this is so
    // we can store refs to the inputs
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // Finds the stitch to focus on and moves
    // the cursor there.
    function moveCursor(row: number, col: number) {
        const key = `${row},${col}`
        const input = inputRefs.current[key]

        // Focus on the selected input
        if (input) {
            input.focus()
        }
    }

    useEffect(() => {

        // Create grid when starting a new project.
        // Notes is chosen arbituarly since a new project will have no 
        // new notes.
        if (knittingProject.needles.type === "") {

            const startingArray = Array.from({length: 1}, 
                () => Array.from({length: stitches}, () => ",")
            )

            dispatch(reformatGrid(startingArray))

            setHasSaved(false)
        }

    // Only render starting grid once
    }, [])


    // Anytime the user makes a change to anything, indicate that they have not saved their project
    useEffect(() => {
        setHasSaved(false)
    }, [knittingProject.nameOfProject, knittingProject.stitches, knittingProject.needles, 
        knittingProject.yarn, knittingProject.notes, knittingProject.rowNotes, 
        knittingProject.progressGrid, knittingProject.finished])

    // Make sure to store all of the users row notes here
    function updateRowNotes(row: number, note: string) {

        // Update prev notes with new ones
        setRowNotes((prevNotes) => {
            const updateNotes = [...prevNotes]
            updateNotes[row] = note
            return updateNotes
        })
    }

    // Toggles autofill for the grid
    function autofillToggle() {

        // If autofill is on, turn it off
        if (toggleAutofill == true) {
            setToggleAutofill(false)
        }

        // If autofill is off, turn it on
        else {
            setToggleAutofill(true)
        }
    }

    // Update the knitting project
    const handleSavingKnittingProject = async (savedProject: KnitProjectFormat) => {
        try {

            if (savedProject.needles.type == "") {
                
            alert(`Knitting project MUST have at least the name of the needles to be saved!`)

            }

            else {
                await updateKnitProject(savedProject).unwrap()

                setHasSaved(true)
            }

        } catch (error) {
            console.error("Could not save project!", error)
        }
    }

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

        // We want to highlight things
        if (toggleHighlight) {

            if (startSelecting == true) {
                // We will create a key from the row + column
                // since that creates a unique value for each stitch.
                // This also ensures we make a unique selection each time.
                const key = stitchRow.toString() + "," + column.toString()

                // Select the new stitches
                setSelectedStitches(previousSelected => {
                    const newlySelectedStitches = new Set(previousSelected)
                    newlySelectedStitches.add(key)
                    return newlySelectedStitches
                })

                if (selectedStitches.has(key)) {
                    
                    const updateStitches = knittingProject.progressGrid[stitchRow][column].split(',')[0] + "," + color

                    dispatch(setProgressGrid({stitchRow: stitchRow, col: column, stitchInfo: updateStitches}))
                }
            }
        }

    }

    // Autofills the stitches from the starting row and column.
    // Does it character by character in the inputted string.
    function autofill(startingRow: number, startingCol: number) {

            // Split the string via whitespace so
            // you can have mult-character stitches
            // like BRK
            const fillText: string[] = knittingProject.autofill.split(" ")
            const lengthOfAutofill = fillText.length

            let stringIndex = 0

            let newStitch = "";

            // This is so the autofill can carry on to the next row
            let additionalRows = 0
            if (startingCol + lengthOfAutofill > knittingProject.progressGrid[0].length && startingRow == knittingProject.progressGrid.length) {
                additionalRows++
            }

            let beginFilling = false

            // Update the array with the auto fill!
            const updatedArray = Array.from({ length: knittingProject.progressGrid.length + additionalRows}, (_, rowIndex) => Array.from( { length: stitches }, 
                        (_, colIndex) => 
                            {   
                                // Start filling when we get to the designated coordinate
                                if (rowIndex == startingRow - 1 && colIndex == startingCol) {
                                    
                                    beginFilling = true
                                }

                                // We now start filling
                                if (beginFilling == true && stringIndex < lengthOfAutofill) {

                                    const oldGrid = knittingProject.progressGrid[rowIndex]?.[colIndex] ?? "" 
                                    
                                    // No highlighting
                                    if (toggleHighlight == false) {
                                        newStitch = fillText[stringIndex] + ',' + '' + ',' + '0'
                                    }

                                    // Highlighting
                                    else {
                                        newStitch = fillText[stringIndex] + ',' + color + ',' + '1'
                                    }

                                    const key = rowIndex.toString() + "," + colIndex.toString()

                                    // Select the new stitches
                                    setSelectedStitches(previousSelected => {
                                        const newlySelectedStitches = new Set(previousSelected)
                                        newlySelectedStitches.add(key)
                                        return newlySelectedStitches
                                    })

                                    stringIndex++

                                    return newStitch ?? oldGrid
                                }
                                
                                else {
                                    return knittingProject.progressGrid[rowIndex]?.[colIndex] ?? ""
                                }

                        }))
                        
                        // Makes it so the tools area goes to where the project
                        // currently is/ the last row.
                        const newPosition = updatedArray.length * 23
                        setPositionOfTools(newPosition)

                        // Move the cursor there too
                        moveCursor(startingRow - 1, startingCol + lengthOfAutofill - 1)
                        
                        dispatch(reformatGrid(updatedArray))
        
    }

    // Changes the color of the stitches.
    function changeColorOfSelectedStitches(color: string) {

        // This makes the changes altogether, then we dispatch it in bulk
        // to the slice for one big change, so we are not individually
        // changing each state. Makes it more efficient!
        const updateColors = Array.from(selectedStitches, (stitch) => {
            
            // Grab the row and column
            const [row, column] = stitch.split(",")

            const stitchRow = Number(row)
            const stitchCol = Number(column)

            const currentCell = knittingProject.progressGrid[stitchRow][stitchCol]

            // Grab the text from the stitch
            const stitchVal = currentCell.split(",")[0]

            return {
                stitchRow,
                stitchCol,
                stitchInfo: `${stitchVal},${color}`
            }

        })
        
        /*
        selectedStitches.forEach(stitch => {
            const stitchRow = Number(stitch.split(',')[0])
            const stitchCol = Number(stitch.split(',')[1])


            // Just changing the color, so keep the old value
            const stitchInfo = knittingProject.progressGrid[stitchRow][stitchCol].split(',')[0] + "," + color
        })

        */

            setColor(color)
            
            dispatch(setProgressGridColors(updateColors))
    }

    // The users project information
    return  (
        // The grid to store a persons knitting project progress/info
        <div>
            <div className={knitGrid.projectHeaders}>
                <p>Knitting project: {projectName}</p>
            </div >
            <div className={knitGrid.needles}>
                <p> Needles: </p>
                <input className={knitGrid.needleInfo} value={knittingProject?.needles?.type ?? ""} onChange={(e) => dispatch(setNeedleType(e.target.value))}/>
                <p> Size: </p>
                <input className={knitGrid.needleInfo} value={knittingProject?.needles?.size ?? ""} onChange={(e) => dispatch(setNeedleSize(e.target.value))}/>
            </div>
            <div className={knitGrid.yarn}>
                <p> Material: </p>
                <input className={knitGrid.yarnInfo} value={knittingProject?.yarn?.material ?? ""} onChange={(e) => dispatch(setYarnMaterial(e.target.value))}/>
                <p> Weight: </p>
                <input className={knitGrid.yarnInfo} value={knittingProject?.yarn?.weight ?? ""} onChange={(e) => dispatch(setYarnWeight(e.target.value))}/>
                <p> Yardage: </p>
                <input className={knitGrid.yarnInfo} value={knittingProject?.yarn?.yardage ?? ""} onChange={(e) => dispatch(setYarnYardage(e.target.value))}/>
                 <p className="ml-15" >More row info</p>
            </div>
            <div className={knitGrid.projectInfoLayout}>            
            <table>
                <tbody>
                    {knittingProject.progressGrid.map((row, rowNumber) => (
                        <tr key={rowNumber} className={knitGrid.stitchRowLayout}>
                            {/* Set a fixed width and height for row numbers, formatting breaks with numbers > 1000 */}
                            <th className="w-8 h-6">{1 + rowNumber++}</th>
                            {row.map((stitch, colIndex) => (
                            <td className={
                                knittingProject.progressGrid[rowNumber - 1][colIndex].split(',')[1] != "" ? knitGrid.stitchSelected : knitGrid.stitch
                            } 
                            style={{
                                backgroundColor: knittingProject.progressGrid[rowNumber - 1][colIndex].split(',')[1] != "" ?  stitch.split(',')[1] : undefined,
                                fontWeight: knittingProject.progressGrid[rowNumber - 1][colIndex].split(',')[1] != "" ? 'bold' : 'normal'

                            }}
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

                                // Autofill feature!
                                if (event.key === "Tab" && toggleAutofill == true && knittingProject.autofill) {
                                    autofill(rowNumber, colIndex)
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
                                                (_, colIndex) => knittingProject.progressGrid[rowIndex]?.[colIndex]) ?? "");

                                            const newPosition = updatedArray.length * 23
                                            
                                            setPositionOfTools(newPosition)

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
                                                (_, colIndex) => knittingProject.progressGrid[rowIndex]?.[colIndex] ?? ""));
                                        dispatch(reformatGrid(updatedArray));
                                        //dispatch(reformatGrid(updatedArray))

                                        setCurrentPosition(`${rowNumber},${colIndex}`)

                                            const newPosition = updatedArray.length * 23
                                            
                                            setPositionOfTools(newPosition)
                                    }
                                }
                            }}
                            onMouseMove={() => selectMultipleStitches(rowNumber - 1, colIndex)}>
                                <input 
                                ref={(element) => {
                                    // Grab the inputs ref to store in record
                                    inputRefs.current[`${rowNumber - 1},${colIndex}`] = element;
                                }}
                                    className={knitGrid.stitchInput}
                                    style={{
                                        color: knittingProject.progressGrid[rowNumber - 1][colIndex].split(',')[2] === '1' ? 'black' : 'white'
                                    }}
                                    value={stitch.split(',')[0]}
                                    onChange={(event) => updateIndividualStitch(rowNumber - 1, colIndex, event.target.value)}
                                />
                            </td>
                            ))}
                        <td>
                            <input className={knitGrid.additionalRowInfo} value={rowNotes[rowNumber - 1] ?? ""} onChange={(e) => updateRowNotes(rowNumber - 1, e.target.value)} />
                        </td>
                        </tr>
                    )
                    )}
                </tbody>
            </table>
            <div className={knitGrid.toolsLayout}
                style={{
                    marginTop: positionOfTools
                }}>
                <Link href='/help'> [Click For Help] </Link>
                <p>Project notes:</p>
                <textarea className={knitGrid.additionalProjectInfo} value={knittingProject.notes} onChange={(e) => dispatch(setNotes(e.target.value))}/> 
                <div className="flex">
                    <p> Highlight color: </p>
                    {toggleHighlight ? (
                        <>
                            <input type="color" defaultValue={"#ffff00"} onChange={(event) => changeColorOfSelectedStitches(event.target.value + ',' + '1')}/>
                            <CheckIcon style={{cursor: "pointer"}} onClick={() => setToggleHghlight(!toggleHighlight)}/>
                            
                        </>
                    ): (
                        <>
                            <input type="color" disabled={true} defaultValue={"#ffff00"} ></input>
                            <X style={{cursor: "pointer"}} onClick={() => setToggleHghlight(!toggleHighlight)}/>
                        </>
                    )}
                </div>        
                <div>
                    { selectedStitches.size > 0 ? (
                    <p>Press escape while clicked-into a stitch to cancel selected stitches. Click on the color box to change selected stitches color</p>
                    ) : (
                    <p>    
                       No stitches selected. Click and drag to start selecting stitches    
                    </p>
                    )
                    }
                </div>
                <br></br>
                <div>
                    <p>
                        (Tab) Stitch autocomplete (NOTE* circle checkmark toggles autocomplete, will also autocomplete with highlight color, stitches are separated by space):
                    </p>

                    <textarea
                        style={{
                            border: "1px solid #ccc"
                        }}
                        defaultValue={knittingProject.autofill}
                        onChange={(event) => dispatch(setAutofill(event.target.value))}>
                    </textarea>
                    <button onClick={autofillToggle}>
                    {toggleAutofill ? (
                         // Autofill on
                        <CheckCircleIcon style={{cursor: "pointer"}}>                      
                        </CheckCircleIcon>
                    ) : (
                        // Autofill off
                        <CheckIcon style={{cursor: "pointer"}}>
                        </CheckIcon>
                    )}
                    </button>
                </div>
                <div>
                    {/* If there is nothing in autofill, do not do anything */}
                    {toggleAutofill == true  && knittingProject.autofill == "" ? (
                        <>
                            <p>
                                Autofill is empty!
                            </p>
                        </>
                    ) : (
                        <>
                        </>
                    )}
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "row"
                }}>
                    <button 
                    className={knitGrid.saveProjectButton} 
                    onClick={() => handleSavingKnittingProject({
                        projectId: knittingProject.projectID,
                        nameOfProject: nameOfProject, 
                        stitches: stitches,
                        needles: knittingProject.needles,
                        yarn: knittingProject.yarn,
                        progressGrid: knittingProject.progressGrid,
                        notes: knittingProject.notes,
                        rowNotes: rowNotes,
                        autofill: knittingProject.autofill,
                        finished: false,
                        })}> 
                        Save project
                    </button>
                    {/* Saving project, so show the icon */}
                    {isUpdating ? (
                        <SaveCheck >

                        </SaveCheck>
                    ) :
                    (
                        <>
                        </>
                    )
                    }
                    {hasSaved ? (
                        <></>
                    ) : (
                        <div style={{
                            paddingTop: 5
                        }}>
                        <p>
                        (This project has unsaved changes)
                        </p>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    )
    
}