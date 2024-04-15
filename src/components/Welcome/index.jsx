import React, { useState, Fragment, useContext, useEffect } from 'react';
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
import DiscuGroupe from '../../components2/Groupe';

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
                        <Route path="discussions" element={<Discussions />} /> {/* Utilisez element au lieu de Component */}
                        <Route path='listedesutilisateurs' element={<Liste />}/>
                        <Route path='document' element={<Document />}/>
                        <Route path='discugroupe' element={<DiscuGroupe userData={userData}/>}/>
                        {/*<Route path="docexcel" element={<Excel />} />
                        <Route path="docpdf" element={<Pdf />}/>
                        <Route path="docword" element={<Word />}/>*/}
                        <Route path='param' element={<Setting />}/>
                        {/* Ajoutez d'autres sous-routes au besoin */}
                    </Routes>
                </div>
                
        </div>
    );
};

export default Welcome;
