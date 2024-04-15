import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { Link } from 'react-router-dom';
import { getFirestore, onSnapshot, collection, query, where, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Modal } from 'react-bootstrap';

const Profil = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addingFriend, setAddingFriend] = useState(false);
  const [removingFriend, setRemovingFriend] = useState(false);
  const [currentUserFriends, setCurrentUserFriends] = useState([]);
  const currentUser = firebaseAuth.currentUser;

  useEffect(() => {
    const db = getFirestore();
    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection, where('etat', '==', true));

    const unsubscribe = onSnapshot(usersQuery, snapshot => {
      const usersData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUser.uid);
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(userDocRef, snapshot => {
      const userData = snapshot.data();
      if (userData && userData.amis) {
        setCurrentUserFriends(userData.amis);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleShowProfile = (user) => {
    setSelectedUser(user);
  };

  const handleCloseProfile = () => {
    setSelectedUser(null);
  };

  const handleAddFriend = async () => {
    setAddingFriend(true);
    const db = getFirestore();
    const currentUserDocRef = doc(db, 'users', currentUser.uid);
    const selectedUserDocRef = doc(db, 'users', selectedUser.id);

    try {
      await updateDoc(currentUserDocRef, {
        amis: arrayUnion(selectedUser.id)
      });

      await updateDoc(selectedUserDocRef, {
        amis: arrayUnion(currentUser.uid)
      });

      console.log('Utilisateur ajouté comme ami avec succès');
      setAddingFriend(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'ami:', error);
      setAddingFriend(false);
    }
  };

  const handleRemoveFriend = async () => {
    setRemovingFriend(true);
    const db = getFirestore();
    const currentUserDocRef = doc(db, 'users', currentUser.uid);
    const selectedUserDocRef = doc(db, 'users', selectedUser.id);

    try {
      await updateDoc(currentUserDocRef, {
        amis: arrayRemove(selectedUser.id)
      });

      await updateDoc(selectedUserDocRef, {
        amis: arrayRemove(currentUser.uid)
      });

      console.log('Ami retiré avec succès');
      setRemovingFriend(false);
    } catch (error) {
      console.error('Erreur lors du retrait d\'ami:', error);
      setRemovingFriend(false);
    }
  };

  // Vérifier si l'utilisateur actuel et l'utilisateur sélectionné sont amis
  const areFriends = selectedUser && currentUserFriends.includes(selectedUser.id);

  return (
    <div className="container">
      <h2>Liste des utilisateurs connectés :</h2>
      <div>
        {users.map(user => (
          <div key={user.id}>
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title">{user.nom} {user.prenom}</h5>
                <p className="card-text">Email: <strong>{user.email}</strong></p>
                <p className="card-text">Département: <strong>{user.departement}</strong></p>
                <span className='position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle'></span>
                <button className="btn btn-primary" onClick={() => handleShowProfile(user)}>Voir Profil</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={selectedUser !== null} onHide={handleCloseProfile}>
        <Modal.Header closeButton>
          <Modal.Title>Informations sur l'utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              {selectedUser.profileImage && (
              <div className='text-center'>
                <img src={selectedUser.profileImage} alt="Photo de profil" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              )}
              <p><strong>{selectedUser.nom} {selectedUser.prenom}</strong></p>
              <p>Email: <strong>{selectedUser.email}</strong></p>
              <p>Département: <strong>{selectedUser.departement}</strong></p>
              {areFriends ? 
              (<div className='container'>
                <div className='row'>
                  <div className='col-md-6 mt-3'>
                    <span className='alert alert-success'>Vous êtes amis</span>
                  </div>
                </div>
              </div>)
              :
              (<span className='alert alert-danger'>Vous n'êtes pas amis</span>)
              }
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {areFriends ? (
            <button className='btn btn-danger' onClick={handleRemoveFriend} disabled={removingFriend}>
              {removingFriend ? 'Retrait en cours...' : 'Retirer ami'}
            </button>
          ) : (
            <button className='btn btn-success' onClick={handleAddFriend} disabled={addingFriend}>
              {addingFriend ? 'Ajout en cours...' : 'Ajouter comme ami'}
            </button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profil;
