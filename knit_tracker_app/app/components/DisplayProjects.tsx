'use client';
import React, { useState } from 'react'
import displayProjectStyles from './DisplayProjects.module.css'
import{ useDeleteKnittingProjectMutation, useGetSavedKnittingProjectsQuery, useAddKnittingProjectMutation } from '../redux/slices/saveKnittingProjectSlice'
import {useDispatch, useSelector} from "react-redux"
import {AppDispatch, RootState } from "../redux/store";
import {useRouter} from "next/navigation"
import { setNameOfProject, setStitches, setNeedleType, setNeedleSize, setYarnMaterial, setYarnWeight, setYarnYardage, setProjectID, reformatGrid, clearGrid, setNotes, setRowNotes, finishedProject, setProgressGrid, setAutofill  } from '../redux/slices/knittingProjectSlice'
import Link from 'next/link'
import { consoleAsyncStorage } from 'next/dist/server/app-render/console-async-storage.external';

type UserSelectedProject = {
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

export default function DisplayProjects() {

    // Retrieve all of the users projects
    const { data } = useGetSavedKnittingProjectsQuery()

    const [deleteProject] = useDeleteKnittingProjectMutation()

    const [addProject] = useAddKnittingProjectMutation()

    const dispatch = useDispatch<AppDispatch>();

    const knittingProject = useSelector((state: RootState) => state.knittingProject)

    const router = useRouter()

    const [projectStitches, setProjectSitches] = useState("")
    const [projectName, setProjectName] = useState("") 

    // Does the user actually have saved projects?
    const usersExistingProjects = data ? data : []


    // Create the knitting project
    const handleCreatingKnittingProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            // Save the blank project to the database.
            const newProject = {
                projectId: "",
                nameOfProject: projectName,
                stitches: Number(projectStitches),
                needles: {
                    type: "",
                    size: "",
                },
                yarn: {
                    material: "",
                    weight: "",
                    yardage: "",
                },
                notes: "",
                rowNotes: [],
                autofill: "",
                progressGrid: [],
                finished: false,
            };
            

            console.log(newProject.stitches);

            const createdProject = await addProject(newProject).unwrap()

            dispatch(setProjectID(createdProject.projectId))
            dispatch(setNameOfProject(projectName))
            dispatch(setStitches(Number(projectStitches)))
            dispatch(setNeedleType(""))
            dispatch(setNeedleSize(""))
            dispatch(setYarnMaterial(""))
            dispatch(setYarnWeight(""))
            dispatch(setYarnYardage(""))
            dispatch(setNotes(""))
            dispatch(setAutofill(""))
            dispatch(setRowNotes([]))
            dispatch(finishedProject(false))



            router.push("/project-page")

        } catch (error) {
            console.error("Could not save project!", error)
        }
    }

    // This is so we can display the selected projects information on the project page
    function displayUsersChosenProject(knittingProject: UserSelectedProject) {

        event?.preventDefault();

        console.log(knittingProject);

        dispatch(setNameOfProject(knittingProject.nameOfProject))
        dispatch(setStitches(knittingProject.stitches))
        dispatch(setNeedleType(knittingProject.needles.type))
        dispatch(setNeedleSize(knittingProject.needles.size))
        dispatch(setYarnMaterial(knittingProject.yarn.material))
        dispatch(setYarnWeight(knittingProject.yarn.weight))
        dispatch(setYarnYardage(knittingProject.yarn.yardage))
        dispatch(setNotes(knittingProject.notes))
        dispatch(setRowNotes(knittingProject.rowNotes))
        dispatch(setAutofill(knittingProject.autofill))
        dispatch(reformatGrid(knittingProject.progressGrid))
        dispatch(finishedProject(false))


    }

    // Creating a new project just sets these to blank values so a new one can be created.
    function createNewProject(e: React.FormEvent) {
        e.preventDefault()

        
        dispatch(setProjectID("Blank"))
        dispatch(setNameOfProject(projectName))
        dispatch(setStitches(Number(projectStitches)))
        dispatch(setNeedleType(""))
        dispatch(setNeedleSize(""))
        dispatch(setYarnMaterial(""))
        dispatch(setYarnWeight(""))
        dispatch(setYarnYardage(""))
        dispatch(setNotes(""))
        dispatch(setAutofill(""))
        dispatch(setRowNotes([]))
        dispatch(finishedProject(false))

        router.push("/project-page")
    }

    // Delete the project from saved projects
    const handeDeletingProject = async (knittingProjectId: string, knittingProjectName: string) => {
        try {

            const confirmation = confirm(`Are you sure you want to delete ${knittingProjectName}? This action cannot be undone`)

            if (confirmation) {
                await deleteProject(knittingProjectId).unwrap()
            }
            else {
                return;
            }

        } catch (error) {
            console.error("Could not save project!", error)
        }
    }

    return (
        <div>
            <div>
                <Link href="/project-page" >Go Back to Current Project</Link> 
            </div>
            <br>
            </br>
            <p>
                Saved projects:
            </p>
            <ul>
                {usersExistingProjects.map((project) => (
                    <li key={project.projectId}>
                        <div className={displayProjectStyles.displayedProjects}>
                            <Link href="/project-page" onClick={() => displayUsersChosenProject(project)}>
                                {project.nameOfProject}
                            </Link>
                            <button 
                                className={displayProjectStyles.deleteButton}
                                onClick={() => handeDeletingProject(project.projectId, project.nameOfProject)}>
                                Delete project
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <div>
                Create a new project!
                <form onSubmit={handleCreatingKnittingProject}>
                    <div>
                        <input
                        className="w-55" 
                        type="number"
                        placeholder="Stitch count"
                        value={projectStitches}
                        onChange={e => setProjectSitches(e.target.value)}
                        required/>

                        <input
                        className="w-55" 
                        type="text"
                        placeholder="Name of Project"
                        value={projectName}
                        onChange={e => setProjectName((e.target.value))}
                        required/>
                    </div>
                    <div>
                        <button type="submit" style={{cursor: "pointer"}}>
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}