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

           
            const response = await loginUser({username, password})

            console.log(response)

            // Login credentials ok!
            if (response.data.detail != "Invalid username or password") {
                setLoginStatus(true)
                router.replace("/saved-projects")
                setLoginStatus(false)
            }

            // Not good
            else {
                setErrorMessage("Incorrect user name or password")
            }

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.message)
            }
        }
    }

    // For the loading animation thing to make it feel like it is loading.
    // Sometimes, it will just not have an "animation". this
    // happens if the user puts an incorrect passsword, but then their
    // correct password
    useEffect(() => {

        let dotCount = 0

        if (errorMessage != "Incorrect user name or password!") {
        
            const interval = setInterval(() => {
                dotCount = (++dotCount) % 4; //, 4 dots
                setLoginProgess(`Logging in${".".repeat(dotCount)}`);
            }, 20);

            return () => clearInterval(interval)
        }



    }, [loginStatus])

  return (
    <div className={loginStyles.pageFormat}>
        <div className={loginStyles.loginPageTitle}>
            Welcome to Knit Grids!
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
                    <div>
                        {errorMessage}
                    </div>
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
            <div style={{
                display: "flex",
                flexDirection: "column"
            }}>
                <Link href="/register">
                    Create an Account
                </Link>
                {/*
                <Link href="/forgot-password">
                    Forgot password
                </Link>
                */}
            </div>
        </div>
    </div>
  )
}

export default LoginPage