'use client';
import {useEffect} from 'react';
import Link from "next/link"
import KnittingProject from '../components/KnittingProject'
import { useSelector } from "react-redux";
import {useRouter} from "next/navigation"
import csrfRoute from "../apiRoutes/csrfAPI";
import { RootState } from "../redux/store";

// Verify that there is a currently logged in
// AND authorized user.
async function verifyUser(): Promise<Authed> {
    const response = await csrfRoute.get('/currentAuthStatus/')

    return response.data;
}

interface Authed {
    authenticated: boolean
}

const page = () => {

    const router = useRouter()

    // Check if user is verified upon mounting.
    useEffect(() => {
        async function verified() {
            const verified = await verifyUser()

            if (!verified.authenticated) {
                router.replace("/") // go back to login if user is not authed.
            }
        }

        verified();

    }, [])

  // Before the states so we can set the default color to yellow
  const knittingProject = useSelector((state: RootState) => state.knittingProject)


  return (
    <div>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
        <Link href='/saved-projects'> [Saved projects]</Link>
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
