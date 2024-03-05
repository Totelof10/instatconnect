import React from 'react'
import { Link } from 'react-router-dom'
const Header = () => {
  return (
    <div>
      <h1><Link to='/' style={{textDecoration:'none'}}>INSTATCONNECT</Link></h1>
    </div>
  )
}

export default Header
