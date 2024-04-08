import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';

const Profil = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
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

  const openOffcanvas = (user) => {
    setSelectedUser(user);
    setOffcanvasOpen(true);
  };

  const closeOffcanvas = () => {
    setSelectedUser(null);
    setOffcanvasOpen(false);
  };

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
                <button className="btn btn-primary" onClick={() => openOffcanvas(user)}>Voir Profil</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Offcanvas */}
      {selectedUser && (
        <div className={`offcanvas offcanvas-start ${offcanvasOpen ? 'show' : ''}`} tabIndex="-1" role="dialog" aria-labelledby="offcanvasExampleLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasExampleLabel">Informations de l'utilisateur</h5>
            <button type="button" className="btn-close text-reset" onClick={closeOffcanvas}></button>
          </div>
          <div className={`offcanvas-body ${offcanvasOpen ? 'show' : ''}`}>
            {selectedUser.profileImage && (
              <div className='text-center'>
                <img src={selectedUser.profileImage} alt="Photo de profil" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
            )}
            <p>Nom:<strong>{selectedUser.nom}</strong></p>
            <p>Prénom(s):<strong>{selectedUser.prenom}</strong></p>
            <p>Email: <strong>{selectedUser.email}</strong></p>
            <p>Département: <strong>{selectedUser.departement}</strong></p>
            {/* Ajoutez d'autres informations de profil si nécessaire */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;
