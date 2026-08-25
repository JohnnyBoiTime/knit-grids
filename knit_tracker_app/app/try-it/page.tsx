import React from 'react'
import KnittingProject from '../components/KnittingProject'
import Link from "next/link"

const page = () => {
  return (
    <div>
        <Link href='/'>[Back to login]</Link>
        <KnittingProject nameOfProject={"Demo"} stitches={20} demo={true}></KnittingProject>
    </div>
  )
}

export default page