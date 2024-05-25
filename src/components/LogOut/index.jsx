import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { FirebaseContext } from '../FireBase/firebase'
import { signOut } from 'firebase/auth'
import { getFirestore, doc, updateDoc, collection } from 'firebase/firestore'


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
                        .then(()=>{
                            const db = getFirestore()
                            const userDocRef = doc(collection(db,'users'),props.userData.id)
                            updateDoc(userDocRef, { etat : false})
                            .then(() => {
                                console.log("Utilisateur déconnecté avec succès")
                            })
                            .catch((error) => {
                                console.error("Erreur lors de la déconnexion :", error)
                            })
                        })
                        .catch((error)=>{
                            console.error("Erreur lors de la déconnexion :", error)
                        })
                        
                        .finally(()=>{
                            setShowSuccessAnimation(false)
                        })
                }, 3000)
            
        }
    }, [checked, firebaseAuth])

    const handleChange = (e) => {
        setChecked(e.target.checked)
    }

    return (
        <div>
            <div className='logout-container'>
                <nav className="navbar navbar-expand-lg bg-body-tertiary">
                    <div className="container-fluid">
                        {showSuccessAnimation ? 
                        (<a className="navbar-brand">
                            Au revoir {props.userData.prenom}
                        </a>):
                        (<a className="navbar-brand">
                            Bienvenu {props.userData.prenom}
                        </a>)}
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                    <Link className="nav-link" aria-current="page" to='accueil'><i className="home icon big"></i></Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to='actualites'><i className='newspaper outline icon big'></i></Link>
                                </li>
                                <li className="nav-item">
                                <Link className="nav-link" to='document'>
                                    <i className="folder icon big"></i>
                                </Link>
                                </li>
                                <li className="nav-item">
                                <Link className="nav-link" to='docpublic'>
                                     <i className="folder open icon big"></i>
                                </Link>
                                </li>
                                <li className="nav-item">
                                <Link className="nav-link"to='event'>
                                     <i className="calendar alternate icon big"></i>
                                </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className="nav-link" to='discussions'>
                                        <i className="wechat icon big"></i>
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className="nav-link" to='listedesutilisateurs'>
                                        <i className="th list icon big"></i>
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className="nav-link" to='discugroupe'>
                                        <i className="users icon big"></i>
                                    </Link>
                                </li>
                            </ul>
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
            </div>
        </div>
        
    )
}

export default LogOut
