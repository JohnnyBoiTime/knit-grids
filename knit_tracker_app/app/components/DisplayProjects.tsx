'use client';
import React, { useCallback, useEffect, useState } from 'react'
import csrfRoute from '../apiRoutes/csrfAPI'
import displayProjectStyles from './DisplayProjects.module.css'
import{ useDeleteKnittingProjectMutation, useGetSavedKnittingProjectsQuery } from '../redux/slices/saveKnittingProjectSlice'
import {useDispatch} from "react-redux"
import {AppDispatch } from "../redux/store";
import { RootState } from "../redux/store";
import { setNameOfProject, setStitches, setNeedleType, setNeedleSize, setYarnMaterial, setYarnWeight, setYarnYardage, setProjectID, reformatGrid, clearGrid, setNotes, setRowNotes, finishedProject  } from '../redux/slices/knittingProjectSlice'
import Link from 'next/link'
import KnittingProject from './KnittingProject';

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
    progressGrid: string[][]
    finished: boolean
}

export default function DisplayProjects() {

    const { data } = useGetSavedKnittingProjectsQuery()

    const [deleteProject] = useDeleteKnittingProjectMutation()

    const dispatch = useDispatch<AppDispatch>();

    // Does the user actually have saved projects?
    const projects = data ? data : []

    // This is so we can display the selected projects information on the project page
    function displayUsersChosenProject(knittingProject: UserSelectedProject) {
        dispatch(setProjectID(knittingProject.projectId))
        dispatch(setNameOfProject(knittingProject.nameOfProject))
        dispatch(setStitches(knittingProject.stitches))
        dispatch(setNeedleType(knittingProject.needles.type))
        dispatch(setNeedleSize(knittingProject.needles.size))
        dispatch(setYarnMaterial(knittingProject.yarn.material))
        dispatch(setYarnWeight(knittingProject.yarn.weight))
        dispatch(setYarnYardage(knittingProject.yarn.yardage))
        dispatch(setNotes(knittingProject.notes))
        dispatch(setRowNotes(knittingProject.rowNotes))
        dispatch(reformatGrid(knittingProject.progressGrid))
        dispatch(finishedProject(false))
        console.log(knittingProject)
    }

    const handeDeletingProject = useCallback(async (knittingProjectId: string, knittingProjectName: string) => {
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
    }, [deleteProject])


    return (
        <div>
            <div>
                <Link href="/project-page" >Go Back</Link> 
            </div>
            <p>
                Saved projects:
            </p>
            <ul>
                {projects.map((project) => (
                    <li key={project.projectId}>
                        <div className={displayProjectStyles.displayedProjects}>
                            <Link href='/project-page' onClick={() => displayUsersChosenProject(project)}>
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
        </div>
    )
}
