import React from 'react'
import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className='landing-container'>
      <div className='landing-button-container'>
        <Link className='ui teal basic button' to='/signup' style={{textDecoration:'none'}}>Inscription</Link>
        <Link className='ui blue basic button' to='/login' style={{textDecoration:'none'}}>Connexion</Link>
      </div>
    </div>
  )
}

export default Landing
