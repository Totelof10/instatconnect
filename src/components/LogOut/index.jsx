import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FirebaseContext } from '../FireBase/firebase';
import { signOut } from 'firebase/auth';
import { getFirestore, doc, updateDoc, collection } from 'firebase/firestore';
import './log.css';

const LogOut = (props) => {
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const firebaseAuth = useContext(FirebaseContext);

    const handleLogout = useCallback(() => {
        setShowSuccessAnimation(true);
        setTimeout(() => {
            console.log("Déconnexion");
            signOut(firebaseAuth)
                .then(() => {
                    const db = getFirestore();
                    const userDocRef = doc(collection(db, 'users'), props.userData.id);
                    updateDoc(userDocRef, { etat: false })
                        .then(() => {
                            console.log("Utilisateur déconnecté avec succès");
                        })
                        .catch((error) => {
                            console.error("Erreur lors de la déconnexion :", error);
                        });
                })
                .catch((error) => {
                    console.error("Erreur lors de la déconnexion :", error);
                })
                .finally(() => {
                    setShowSuccessAnimation(false);
                });
        }, 3000);
    }, [firebaseAuth, props.userData.id]);

    return (
        <div>
            <div className='logout-container'>
                <nav className="navbar navbar-expand-lg bg-body-tertiary">
                    <div className="container-fluid">
                        {showSuccessAnimation ? 
                            (<span className="navbar-brand" style={{fontStyle:'italic'}}>
                                <strong><p style={{color:'red'}}>Au revoir</p>{props.userData.prenom}</strong>
                            </span>) :
                            (<span className="navbar-brand" style={{fontStyle:'italic'}}>
                                <strong>Bienvenue {props.userData.prenom}</strong>
                            </span>)
                        }
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
                                    <Link className="nav-link" to='event'>
                                        <i className="calendar alternate icon big"></i>
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className="nav-link" to='discussions'>
                                        <i className="wechat icon big"></i>
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className="nav-link" to='discugroupe'>
                                        <i className="users icon big"></i>
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className="nav-link" to='listedesutilisateurs'>
                                        <i className="th list icon big"></i>
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className='nav-link' to='param'>
                                        <i className="cog icon big"></i>
                                    </Link>  
                                </li>
                                <li className='nav-item'>
                                    <button className='nav-link' onClick={handleLogout}>
                                        <i className="sign-out icon big"></i> Déconnexion
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default LogOut;
