import React from 'react';
import Pdf from './Pdf';
import Excel from './Excel';
import Word from './Word';

const Document = () => {
  return (
    <div className='container' >
      <div className='row'>
        <div className='col-md-4 mb-4 mt-2'>
          <div className='border border-white rounded' style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.2)' }}>
            <Pdf />
          </div>
        </div>
        <div className='col-md-4 mb-4 mt-2'>
          <div className='border border-white rounded' style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.2)' }}>
            <Excel />
          </div>
        </div>
        <div className='col-md-4 mt-2'>
          <div className='border border-white rounded' style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.2)' }}>
            <Word />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Document;
