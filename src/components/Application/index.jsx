import React from 'react'

const Application = (props) => {
  return (
    <div className='application-container'>
      <h3>Bienvenu {props.userData.pseudo}</h3>
    </div>
  )
}

export default Application
