'use client';
import React from 'react'
import csrfRoute from '../apiRoutes/csrfAPI'
import{ useGetSavedKnittingProjectsQuery } from '../redux/slices/saveKnittingProjectSlice'

export default function DisplayProjects() {

    const { data } = useGetSavedKnittingProjectsQuery()

    // Does the user actually have saved projects, or none?
    const projects = data ? data : []

    return (
        <div>
            <p>
                Saved projects:
            </p>
            <ul>
                {projects.map((project, index) => (
                    <li key={index}>
                        <div>
                            {project.nameOfProject}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
