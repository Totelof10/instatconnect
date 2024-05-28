import React, { useState, useContext, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Edit from '../../components2/Edit';
import { FirebaseContext } from '../FireBase/firebase';

const Setting = () => {
  const navigateTo = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false); // State pour le chargement
  const firebaseAuth = useContext(FirebaseContext);
  const [userData, setUserData] = useState();
  const [userSession, setUserSession] = useState(null);
  const firestore = getFirestore();
  const storage = getStorage();
  const inputFileRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        setUserSession(user);
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
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

  const displayForm = () => {
    setShowForm(!showForm);
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    const storageRef = ref(storage, `profile_images/${userSession.uid}/${file.name}`);
    
    try {
      setLoading(true); // Mettre le chargement à true pendant le téléchargement
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateDoc(doc(firestore, 'users', userSession.uid), {
        profileImage: downloadURL
      });
      
      setUserData(prevUserData => ({
        ...prevUserData,
        profileImage: downloadURL
      }));
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image :', error);
    } finally {
      setLoading(false); // Mettre le chargement à false une fois le téléchargement terminé
    }
  };

  return (
    <div>
      {userData && userData.profileImage && (
        <div className='text-center'>
          {loading ? (
            <div className='profileLoader'
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
            >

            </div>
          ) : (
            <img
              src={userData.profileImage}
              alt='Photo de profil'
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => inputFileRef.current.click()}
            />
          )}
          <input
            type='file'
            accept='image/*'
            style={{ display: 'none' }}
            ref={inputFileRef}
            onChange={handleProfileImageChange}
          />
        </div>
      )}
      <ul className='list-group mt-2 text-center'>
        <li className='list-group-item'>Nom : {userData && userData.nom}</li>
        <li className='list-group-item'>Prénom(s) : {userData && userData.prenom}</li>
        <li className='list-group-item'>Adresse email : {userData && userData.email}</li>
        <li className='list-group-item'>Département : {userData && userData.departement}</li>
        <li className='list-group-item'>Numéro de téléphone : {userData && userData.numeroTelephone}</li>
      </ul>
      <button className='btn btn-warning mt-2' onClick={displayForm}>
        <strong>Modifier </strong>
        <i className='edit icon big'></i>
      </button>
      {showForm && <Edit userData={userData} />}
    </div>
  );
};

export default Setting;
