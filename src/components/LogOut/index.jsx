import React,{ useState, useEffect, useContext }from 'react'
import { FirebaseContext } from '../FireBase'
import { Link, useNavigate } from 'react-router-dom'

const LogOut = () => {

    const [checked, setChecked] = useState(false)
    //console.log(checked)

    const fireBase = useContext(FirebaseContext)

    useEffect(()=>{
        if(checked){
            console.log("Deconnexion")
            fireBase.logoutUser()
        }
    },[checked, fireBase])

    const handleChange = (e) => {
        setChecked(e.target.checked)
    }

  return (
    <div className='logout-container'>
        <label className="switch">
            <input type="checkbox"
                checked={checked}
                onChange={handleChange}
            
            />
            <span className="slider round"></span>
        </label>
    </div>
  )
}

export default LogOut
