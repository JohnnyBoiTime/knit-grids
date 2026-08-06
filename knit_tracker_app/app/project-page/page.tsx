'use client';
import Link from "next/link"
import KnittingProject from '../components/KnittingProject'
import { useSelector } from "react-redux";
import csrfRoute from "../apiRoutes/csrfAPI";
import { RootState } from "../redux/store";

// Logs the user out.
async function logOutUser() {

    return csrfRoute.post('/logout/')
    
}


const page = () => {

    // Logout the user.
    const logOut = async () => {
        try {
            await logOutUser()
        } catch(error) {
            console.log(error)
        }
    }

  // Before the states so we can set the default color to yellow
  const knittingProject = useSelector((state: RootState) => state.knittingProject)


  return (
    <div>
    <div style={{display: 'flex', flexDirection: 'column'}}>
        <Link href='/' onClick={logOut}>Log out</Link>
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
