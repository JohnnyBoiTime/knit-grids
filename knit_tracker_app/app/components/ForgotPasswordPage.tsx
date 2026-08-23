'use client'
import React, { useState } from 'react'
import loginStyles from './LoginPage.module.css'
import csrfRoute from '../apiRoutes/csrfAPI'
import {useRouter} from "next/navigation"
import Link from "next/link"

interface ResetPassword {
    email: string
}

// Resets the users password to something else
async function resetPassword(data: ResetPassword) {

    return csrfRoute.post('/forgotPassword/', data)

}

const ForgotPassword = () => {

    const [email, setEmail] = useState("")

    const router = useRouter()

    async function sendResetPasswordEmail(e: React.FormEvent) {
        e.preventDefault()

        const response = await resetPassword({email})
        
        // Go back to login.
        if (response.status == 200) {
            router.replace("/")
        }
    
    }

  return (
    <div className={loginStyles.pageFormat}>
        <div className={loginStyles.loginPageTitle}>
            Forgot password
        </div>
        <div className={loginStyles.loginCard}>
            <form onSubmit={sendResetPasswordEmail} className={loginStyles.formFormat}>
             <div className="w">
                    <input 
                        type="text"
                        placeholder="e-mail"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button className="cursor-pointer" type="submit">
                    [Send password change e-mail]
                </button>
            </form>
            <div>
                <Link href="/">
                    [Back to login]
                </Link>
            </div>
        </div>
    </div>
  )
}

export default ForgotPassword