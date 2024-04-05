import React, { useState, Fragment, useContext, useEffect } from 'react';
//import { useSpring, animated } from 'react-spring';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Route, Routes, useNavigate} from 'react-router-dom'
import {FirebaseContext} from '../FireBase/firebase'
import LogOut from '../LogOut';
import { onAuthStateChanged } from 'firebase/auth';
import Accueil from '../../components2/Accueil'
import Actualites from '../../components2/Actualites'
import Discussions from '../../components2/Discussions'
import Excel from '../../components2/Documents/Excel'
import Pdf from '../../components2/Documents/Pdf'
import Word from '../../components2/Documents/Word'
import Setting from '../Setting/index'
import Liste from '../../components2/Liste';
import Document from '../../components2/Documents';

const Welcome = () => {
    const navigateTo = useNavigate();
    const [userSession, setUserSession] = useState(null);
    const [userData, setUserData] = useState({})
    const firebaseAuth = useContext(FirebaseContext);
    const firestore = getFirestore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserSession(user);
                // Utilisation de getDoc pour récupérer les données de l'utilisateur actuellement authentifié à partir de Firestore
                try {
                    const userDocRef = doc(firestore, "users", user.uid); // Assurez-vous que "users" est le nom de votre collection utilisateur
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setUserData(userData);
                    } else {
                        console.log("Le document utilisateur n'existe pas.");
                    }
                } catch (error) {
                    console.log("Erreur lors de la récupération des données utilisateur :", error);
                }
            } else {
                navigateTo('/');
            }
        });
    
        return () => unsubscribe();
    }, [firebaseAuth, firestore, navigateTo]);
    /*const props = useSpring({
        from: { opacity: 0, transform: 'scale(0.5)' },
        to: { opacity: 1, transform: 'scale(1)' },
        config: { duration: 1000 }
      });*/

    return userSession === null ? (
        <Fragment>
            <div className='loader-container'>
                <div className='loader'></div>
            </div>
        </Fragment>
    ) : (
        <div className='welcome-container'>
                <LogOut userData={userData}/>
                <div className='fonction-container'>
                    <Routes>
                        <Route path="accueil" element={<Accueil userData={userData}/>}/>
                        <Route path="actualites" element={<Actualites userData={userData}/>} />
                        <Route path="discussions" Component={Discussions} />
                        <Route path='listedesutilisateurs' Component={Liste}/>
                        <Route path='document' Component={Document}/>
                        {/*<Route path="docexcel" Component={Excel} />
                        <Route path="docpdf" Component={Pdf}/>
                        <Route path="docword" Component={Word}/>*/}
                        <Route path='param' Component={Setting}/>
                        {/* Ajoutez d'autres sous-routes au besoin */}
                    </Routes>
                </div>
                
        </div>
    );
};

export default Welcome;
