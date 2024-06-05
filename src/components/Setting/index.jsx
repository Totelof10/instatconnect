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
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      
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
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      {userData && userData.profileImage && (
        <div className="text-center mb-4">
          {loading ? (
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <img
              src={userData.profileImage}
              alt="Photo de profil"
              className="rounded-circle border border-primary"
              style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => inputFileRef.current.click()}
            />
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={inputFileRef}
            onChange={handleProfileImageChange}
          />
        </div>
      )}
      <ul className="list-group text-center">
        <li className="list-group-item"><strong>Nom:</strong> {userData && userData.nom}</li>
        <li className="list-group-item"><strong>Prénom(s):</strong> {userData && userData.prenom}</li>
        <li className="list-group-item"><strong>Adresse email:</strong> {userData && userData.email}</li>
        <li className="list-group-item"><strong>Département:</strong> {userData && userData.departement}</li>
        <li className="list-group-item"><strong>Numéro de téléphone:</strong> {userData && userData.numeroTelephone}</li>
      </ul>
      <div className="text-center mt-4">
        <button className="btn btn-warning" data-bs-toggle="offcanvas" data-bs-target="#editOffcanvas">
          <strong>Modifier </strong>
          <i className="fas fa-edit"></i>
        </button>
      </div>

      <div className="offcanvas offcanvas-end" tabIndex="-1" id="editOffcanvas">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasRightLabel">Modifier les informations</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <Edit userData={userData} />
        </div>
      </div>
    </div>
  );
};

export default Setting;
