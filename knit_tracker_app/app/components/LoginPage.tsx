'use client'
import React, { useState, useEffect } from 'react'
import {useRouter} from "next/navigation"
import loginStyles from './LoginPage.module.css'
import csrfRoute from '../apiRoutes/csrfAPI'
import Link from "next/link"
import {Eye, EyeOff} from "lucide-react"
import axios from 'axios';

interface User {
    username: string
    email: string
    password: string
}

interface Login {
    username: string
    password: string    
}

// Login the user
async function loginUser(data: Login) {

    return csrfRoute.post('/login/', data)
    
}


const LoginPage = () => {

    
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loginProgess, setLoginProgess] = useState("")
    const [loginStatus, setLoginStatus] = useState(false)
    const [hidePassword, setHidePassword] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")

    const router = useRouter()

    async function loginForm(e: React.FormEvent) {
        e.preventDefault()

        try {

            setLoginStatus(true)
            await loginUser({username, password})

            router.replace("/saved-projects")
            setLoginStatus(false)

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.message)
            }
        }
    }

    // For the loading animation thing to make it feel like it is loading
    useEffect(() => {

        let dotCount = 0

        const interval = setInterval(() => {
            dotCount = (++dotCount) % 4; //, 4 dots
            setLoginProgess(`Logging in${".".repeat(dotCount)}`);
        }, 500);

        return () => clearInterval(interval)

    }, [loginStatus])

  return (
    <div className={loginStyles.pageFormat}>
        <div className={loginStyles.loginPageTitle}>
            Welcome to knit tracker!
        </div>
        <div className={loginStyles.loginCard}>
            <form onSubmit={loginForm} className={loginStyles.formFormat}>
                <input
                    className="w-55" 
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <div className="w">
                    <input 
                        type={hidePassword ? "password" : "text"}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setHidePassword(!hidePassword)}>
                        {hidePassword ? (
                            <Eye size={20}/>
                        ) : (
                            <EyeOff size={20}/>
                        )
                        }
                    </button>
                </div>
                <button className="cursor-pointer" type="submit">
                    Login
                </button>
                {loginStatus ? (
                    <p>
                        {loginProgess}
                    </p>
                ) : (
                    <>
                    </>        
                )
            }
            </form>
            <div>
                <Link href="/register">
                    Create an Account
                </Link>
            </div>
        </div>
    </div>
  )
}

export default LoginPage