import React, { useState, useContext, useEffect, useReducer } from 'react'
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom'
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Edit from '../../components2/Edit';
import {FirebaseContext} from '../FireBase/firebase'

const Setting = () => {
  const navigateTo = useNavigate();
  const [showForm, setShowForm] = useState(false)
  const firebaseAuth = useContext(FirebaseContext)
  const [userData, setUserData] = useState()
  const [userSession, setUserSession] = useState(null);
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
                    console.log(userData)
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

const displayForm = () => {
  if(!showForm){
    setShowForm(true)
  }else{
    setShowForm(false)
  }
}

  return (
    <div>
      <i class="user icon big m-2"></i>
      <ul className="list-group">
        <li className="list-group-item">Nom : {userData && userData.nom}</li>
        <li className="list-group-item">Prénom(s) : {userData && userData.prenom}</li>
        <li className="list-group-item">Adresse email : {userData && userData.email}</li>
        <li className="list-group-item">Département : {userData && userData.departement}</li>
      </ul>
      <button className='btn btn-warning mt-2' onClick={displayForm}><strong>Modifier </strong><i class="edit icon big"></i></button>
      {showForm && (
        <Edit userData={userData}/>
      )}
    </div>
  )
}

export default Setting
