'use client'
import React, { useState } from 'react'
import loginStyles from './LoginPage.module.css'
import csrfRoute from '../apiRoutes/csrfAPI'
import axios from 'axios'
import Link from "next/link"
import {useRouter} from "next/navigation"
import {Eye, EyeOff} from "lucide-react"
import { useSearchParams } from 'next/navigation';

interface ChangePassword {
    email: string
    token: string
    newPassword: string
}

// Register the user
async function changePassword(data: ChangePassword) {

    return csrfRoute.post('/resetPassword/', data)

}

const ChangePasswordPage = () => {

    const requestParams = useSearchParams()

    // Grab the email and token from the reset link
    const email = requestParams.get("email")
    const token = requestParams.get("token")

    const [newPassword, setNewPassword] = useState("")
    const [hideNewPassword, setHideNewPassword] = useState(true)
    const [confirmNewPassword, setConfirmNewPasswordPassword] = useState("")
    const [hideConfirmNewPassword, setHideConfirmNewPassword] = useState(true)

        const router = useRouter()


    async function registerForm(e: React.FormEvent) {
        e.preventDefault()

        try {
            // narrow email and token to strings so typescript no complain.
            if (!email || !token) {
                return
            }
            
            if (newPassword !== confirmNewPassword) {
                confirm("The passwords do not match.")
            }
            else {
                await changePassword({email, token, newPassword})
            
                alert("The password has been changed!")
                
                router.replace("/")
                
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert("The password has not been changed: " + error.response?.data.message)
            }
        }

    }

  return (
    <div className={loginStyles.pageFormat}>
        <div className={loginStyles.loginPageTitle}>
            Reset Password
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
                        placeholder="Confirm Password"
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
                    Change Password
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