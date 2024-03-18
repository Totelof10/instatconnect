import React, { useState, Fragment, useContext, useEffect } from 'react';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import {FirebaseContext} from '../FireBase/firebase'
import LogOut from '../LogOut';
import Application from '../Application';
import { onAuthStateChanged } from 'firebase/auth';

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
        <div>
            <LogOut />
            <Application userData={userData}/>
        </div>
    );
};

export default Welcome;
