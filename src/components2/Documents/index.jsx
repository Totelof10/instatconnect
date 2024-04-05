import React from 'react'
import Pdf from './Pdf'
import Excel from './Excel'
import Word from './Word'

const Document = () => {
  return (
    <div className='container'>
        <div className='row'>
            <div className='col-md-4 border border-2' style={{maxHeight: '400px', overflowY:'auto'}}><Pdf/></div>
            <div className='col-md-4 border border-2' style={{maxHeight: '400px', overflowY:'auto'}}><Excel/></div>
            <div className='col-md-4 border border-2' style={{maxHeight: '400px', overflowY:'auto'}}><Word/></div>
        </div>
      
    </div>
  )
}

export default Document
