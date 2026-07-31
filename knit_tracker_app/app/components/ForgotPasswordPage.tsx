'use client'
import React, { useState } from 'react'
import loginStyles from './LoginPage.module.css'
import csrfRoute from '../apiRoutes/csrfAPI'
import Link from "next/link"

interface ResetPassword {
    email: string
}


// Resets the users password to something else
async function resetPassword(data: ResetPassword) {

    return csrfRoute.post('/resetPassword/', data)

}

const ForgotPassword = () => {

    const [email, setEmail] = useState("")

    async function sendResetPasswordEmail(e: React.FormEvent) {
        e.preventDefault()

        await resetPassword({email})

    }

  return (
    <div className={loginStyles.pageFormat}>
        <div className={loginStyles.loginPageTitle}>
            Register
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
                    Send password change e-mail
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

export default ForgotPassword