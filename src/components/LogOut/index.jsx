import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { FirebaseContext } from '../FireBase/firebase'
import { signOut } from 'firebase/auth'

const LogOut = (props) => {
    const [checked, setChecked] = useState(false)
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
    const firebaseAuth = useContext(FirebaseContext)

    useEffect(() => {
        if (checked) {
            setShowSuccessAnimation(true)
                setTimeout(()=>{
                    console.log("Déconnexion")
                    signOut(firebaseAuth)
                        .then(() => {
                            console.log("Utilisateur déconnecté avec succès")
                        })
                        .catch((error) => {
                            console.error("Erreur lors de la déconnexion :", error)
                        })
                        .finally(()=>{
                            setShowSuccessAnimation(false)
                        })
                }, 2000)
            
        }
    }, [checked, firebaseAuth])

    const handleChange = (e) => {
        setChecked(e.target.checked)
    }

    return (
        <div className='logout-container'>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <Link className="navbar-brand" to='/welcome'>Bienvenu {props.userData.prenom}</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" aria-current="page" to='accueil'><i className="home icon big"></i></Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to='actualites'>Actualités <i className='newspaper outline icon big'></i></Link>
                        </li>
                        <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Mes documents <i className="folder icon big"></i>
                        </a>
                        <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to='docword'>Word</Link></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li><Link className="dropdown-item" to='docpdf'>Pdf</Link></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li><Link className="dropdown-item" to='docexcel'>Excel</Link></li>
                        </ul>
                        </li>
                        <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="users icon big"></i>
                        </a>
                        <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to='discussion'>Discussions</Link></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li><a className="dropdown-item" href='#'>Amis</a></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li><a className="dropdown-item" href='#'>Groupe</a></li>
                        </ul>
                        </li>
                    </ul>
                    <form className="d-flex" role="search">
                        <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
                        <button className="btn btn-outline-success" type="submit">Search</button>
                    </form>
                    </div>
                </div>
                </nav>
            <div className='setting-container'>
                 <Link to='param' style={{ textDecoration: 'none' }}>Paramètres<i className="cog icon big"></i></Link>  
            </div> 
            <label className="switch">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                />
                <span className="slider round"></span>
            </label>
            {showSuccessAnimation && (
                <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    Déconnexion réussie!
                </div>
            )}
        </div>
    )
}

export default LogOut
