'use client'
import React, { useState } from 'react'
import loginStyles from './LoginPage.module.css'
import csrfRoute from '../apiRoutes/csrfAPI'
import Link from "next/link"
import {Eye, EyeOff} from "lucide-react"

interface ChangePassword {
    newPassword: string
    confirmNewPassword: string
}

// Register the user
async function changePassword(data: ChangePassword) {

    return csrfRoute.post('/resetPassword/', data)

}

const ChangePasswordPage = () => {

    const [newPassword, setNewPassword] = useState("")
    const [hideNewPassword, setHideNewPassword] = useState(true)
    const [confirmNewPassword, setConfirmNewPasswordPassword] = useState("")
    const [hideConfirmNewPassword, setHideConfirmNewPassword] = useState(true)


    async function registerForm(e: React.FormEvent) {
        e.preventDefault()

        const response = await changePassword({newPassword, confirmNewPassword})

    }

  return (
    <div className={loginStyles.pageFormat}>
        <div className={loginStyles.loginPageTitle}>
            Register
        </div>
        <div className={loginStyles.loginCard}>
            <form onSubmit={registerForm} className={loginStyles.formFormat}>
            <div className="w">
                    <input 
                        type={hideNewPassword ? "password" : "text"}
                        placeholder="Password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setHideNewPassword(!hideNewPassword)}>
                        {hideNewPassword ? (
                            <Eye size={20}/>
                        ) : (
                            <EyeOff size={20}/>
                        )
                        }
                    </button>
                </div>
                <div className="w">
                    <input 
                        type={hideConfirmNewPassword ? "password" : "text"}
                        placeholder="Password"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPasswordPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setHideConfirmNewPassword(!hideConfirmNewPassword)}>
                        {hideConfirmNewPassword ? (
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

export default ChangePasswordPage