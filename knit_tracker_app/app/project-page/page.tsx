'use client';
import Link from "next/link"
import KnittingProject from '../components/KnittingProject'
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const page = () => {

      // Before the states so we can set the default color to yellow
    const knittingProject = useSelector((state: RootState) => state.knittingProject)


  return (
    <div>
      <div>
        <Link href='/saved-projects'> Saved projects</Link>
    </div>
    <br>
    </br>
    <div>
        <KnittingProject stitches={knittingProject.stitches} nameOfProject={knittingProject.nameOfProject}></KnittingProject>
    </div>
    </div>
  )
}

export default page
