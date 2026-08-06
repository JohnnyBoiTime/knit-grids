'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation'
import  DisplayProjects  from '../components/DisplayProjects'
import csrfRoute from '../apiRoutes/csrfAPI'
import { router } from 'next/client';

interface Authed {
  authenticated: boolean
}

// Verify that there is a currently logged in
// AND authorized user.
async function verifyUser(): Promise<Authed> {
    const response = await csrfRoute.get('/currentAuthStatus/')

    return response.data;
}

const page = () => {

  const router = useRouter()

  // Check authentication status on component mount
  useEffect(() => {

    async function verified() {

      const verify = await verifyUser();

      if (!verify.authenticated) {
        router.replace("/") // back to log in
      }
    }

    verified();
}, [])


  return (
    <DisplayProjects></DisplayProjects>
  )
}

export default page
