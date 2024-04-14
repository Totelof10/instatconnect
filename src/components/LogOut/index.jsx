import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { FirebaseContext } from '../FireBase/firebase'
import { signOut } from 'firebase/auth'
import { getFirestore, doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import Recherche from '../../components2/Recherche'

const LogOut = (props) => {
    const [checked, setChecked] = useState(false)
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
    const firebaseAuth = useContext(FirebaseContext)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [showResult, setShowResult] = useState(false)
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
                }, 2000)
            
        }
    }, [checked, firebaseAuth])

    const handleChange = (e) => {
        setChecked(e.target.checked)
    }
    const handleSearch = async (e) =>{
        e.preventDefault()
        try {
            const db = getFirestore()
            const usersCollection = collection(db, 'users')
            const q = query(usersCollection, where("nom", ">=", searchQuery.toLowerCase()))
            const querySnapshot = await getDocs(q)
            const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setSearchResults(results)
        } catch (error) {
            console.error('Erreur lors de la recherche des utilisateurs:', error)
        }
    }
    const handleShowResult = () =>{
        setShowResult(!showResult)
    }

    return (
        <div>
            <div className='logout-container'>
                <nav className="navbar navbar-expand-lg bg-body-tertiary">
                    <div className="container-fluid">
                        <a className="navbar-brand">Bienvenu {props.userData.prenom}</a>
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
                            <li className="nav-item">
                            <Link className="nav-link" to='document'>
                                Mes documents <i className="folder icon big"></i>
                            </Link>
                            </li>
                            <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="users icon big"></i>
                            </a>
                            <ul className="dropdown-menu">
                                <li><Link className="dropdown-item" to='discussions'>Discussions</Link></li>
                                <li><hr className="dropdown-divider"/></li>
                                <li><Link className="dropdown-item" to='listedesutilisateurs'>Liste des utilisateurs</Link></li>
                                <li><hr className="dropdown-divider"/></li>
                                <li><a className="dropdown-item" href='#'>Groupe par département</a></li>
                            </ul>
                            </li>
                        </ul>
                        <form className="d-flex" role="search" onSubmit={handleSearch}>
                            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" onChange={e =>{setSearchQuery(e.target.value)}}/>
                            <button className="btn btn-outline-success" type="submit" onClick={handleShowResult} disabled={searchQuery.trim()===''}>Recherche</button>
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
            {showResult ? (<div className='welcome-container'>
                <Recherche searchResults={searchResults}/>
            </div>):''}
            
        </div>
        
    )
}

export default LogOut
