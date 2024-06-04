import React from 'react'
import { useLocation } from 'react-router-dom'

const Footer = () => {
  const location = useLocation()
  if (location.pathname === '/welcome/accueil'){
    return <div className='footer-container-deux'></div>
  }else{
    return <div className='footer-container'></div>
  }
  
}

export default Footer
