import React from 'react'
import Link from "next/link"
import KnittingProject from '../components/KnittingProject'

const page = () => {
  return (
    <div>
        <KnittingProject stitches={20} nameOfProject={"scarf"}></KnittingProject>
    <div>
        <Link href='/saved-projects'> Saved projects</Link>
    </div>
    </div>
  )
}

export default page
