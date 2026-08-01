'use client'
import React, { useState } from 'react'
import loginStyles from './LoginPage.module.css'
import {useRouter} from "next/navigation"
import csrfRoute from '../apiRoutes/csrfAPI'
import Link from "next/link"
import {Eye, EyeOff} from "lucide-react"

interface User {
    username: string
    email: string
    password: string
}


// Register the user
async function registerUser(data: User) {

    return csrfRoute.post('/register/', data)

}

const RegisterPage = () => {

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [hidePassword, setHidePassword] = useState(true)


    const router = useRouter()

    async function registerForm(e: React.FormEvent) {
        e.preventDefault()

        try {

            // See what it brings back.
            const response = await registerUser({username, email, password})

            // It was successfull, so go to login page.
            if (response.data) {
                router.replace("/")
            }

        } catch (error) {
            console.log(error)
        }

    }

  return (
    <div className={loginStyles.pageFormat}>
        <div className={loginStyles.loginPageTitle}>
            Register
        </div>
        <div className={loginStyles.loginCard}>
            <form onSubmit={registerForm} className={loginStyles.formFormat}>
                <input
                    className="w-55" 
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
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
                    Register
                </button>
            </form>
            <div>
                <Link href="/">
                    Back to login
                </Link>
            </div>
        </div>
    </div>
  )
}

export default RegisterPage