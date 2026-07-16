'use client';
import React from 'react'
import Link from "next/link"
import KnittingProject from '../components/KnittingProject'
import { setNameOfProject, setStitches, setNeedleType, setNeedleSize, setYarnMaterial, setYarnWeight, setYarnYardage, setProjectID, reformatGrid, clearGrid, setNotes, setRowNotes, finishedProject } from '../redux/slices/knittingProjectSlice'
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const page = () => {

      // Before the states so we can set the default color to yellow
    const knittingProject = useSelector((state: RootState) => state.knittingProject)


  return (
    <div>
        <KnittingProject stitches={knittingProject.stitches} nameOfProject={knittingProject.nameOfProject}></KnittingProject>
    <div>
        <Link href='/saved-projects'> Saved projects</Link>
    </div>
    </div>
  )
}

export default page
