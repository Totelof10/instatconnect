import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const Profil = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      const usersCollection = collection(db, 'users');
      const usersQuery = query(usersCollection, where('etat', '==', true));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    };

    fetchUsers();
  }, []);

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
                {/* Ajoutez d'autres informations de profil si nécessaire */}
                <a href="#" className="btn btn-primary">Voir Profil</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profil;
