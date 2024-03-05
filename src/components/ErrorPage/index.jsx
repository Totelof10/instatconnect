import React from 'react'
import ErrorImg from '../../images/ErrorPage.png'

const ErrorPage = () => {

  const centerH2={
    textAlign:'center',
    marginTop:'50px'
  }

  const centerImg={
    display:'block',
    margin:'40px auto'
  }
  return (
    <div className='container'>
      <h2 style={centerH2}>Error Page</h2>
      <img style={centerImg}src={ErrorImg}/>
    </div>
  )
}

export default ErrorPage
