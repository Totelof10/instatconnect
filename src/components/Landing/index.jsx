import React from 'react'
import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className='container-md d-flex justify-content-center'>
      <Link className='ui teal basic button' to='/signup' style={{textDecoration:'none'}}>Inscription</Link>
      <Link className='ui blue basic button' to='/login' style={{textDecoration:'none'}}>Connexion</Link>
    </div>
  )
}

export default Landing
