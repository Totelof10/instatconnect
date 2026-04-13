import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './log.css';

const LogOut = (props) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { logout } = useAuth();

    const handleLogout = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            toast.success('Déconnexion réussie !');
        } catch (error) {
            toast.error('Erreur lors de la déconnexion');
        } finally {
            setIsLoggingOut(false);
        }
    }, [logout]);

    return (
        <div>
            <div className='logout-container'>
                <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <ToastContainer />
                    <div className="container-fluid">
                        {/*isLoggingOut ? 
                            (<span className="navbar-brand" style={{fontStyle:'italic'}}>
                                <strong >Déconnexion en cours...</strong>
                            </span>) :
                            (<span className="navbar-brand" style={{fontStyle:'italic'}}>
                                <strong>Bienvenue {props.userData.prenom}</strong>
                            </span>)*/
                        }
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0" style={{marginLeft:'150px'}}>
                            <li className="nav-item">
                                    <Link className="nav-link" aria-current="page" to='accueil'><i className="home icon big" title='Accueil'></i></Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to='actualites'><i className='newspaper outline icon big' title='Actualités'></i></Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to='document'>
                                        <i className="folder icon big" title='Document personnel'></i>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to='docpublic'>
                                        <i className="folder open icon big" title='Document public'></i>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to='event'>
                                        <i className="calendar alternate icon big" title='Evénements'></i>
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className="nav-link" to='discussions'>
                                        <i className="wechat icon big" title='Message'></i>
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className="nav-link" to='discugroupe'>
                                        <i className="users icon big" title='Message de groupe'></i>
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className="nav-link" to='listedesutilisateurs'>
                                        <i className="th list icon big" title='Liste des utilisateurs'></i>
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className='nav-link' to='param'>
                                        <i className="cog icon big" title='Paramètre'></i>
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
