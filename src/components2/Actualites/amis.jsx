import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { getFirestore, onSnapshot, doc } from 'firebase/firestore';

const Amis = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [amisIds, setAmisIds] = useState([]);
  const [amisData, setAmisData] = useState([]);
  const currentUser = firebaseAuth.currentUser;

  useEffect(() => {
    let unsubscribe;
    const fetchAmisIds = async () => {
      if (currentUser) {
        const db = getFirestore();
        const userDocRef = doc(db, 'users', currentUser.uid);

        unsubscribe = onSnapshot(userDocRef, snapshot => {
          const userData = snapshot.data();
          if (userData && userData.amis) {
            setAmisIds(userData.amis);
          } else {
            setAmisIds([]);
          }
        });
      }
    };

    fetchAmisIds();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  useEffect(() => {
    const db = getFirestore();
    const unsubscribeAmis = [];

    const fetchAmisData = async () => {
      const amisDataList = [];

      amisIds.forEach(amiId => {
        const amiDocRef = doc(db, 'users', amiId);

        const unsubscribe = onSnapshot(amiDocRef, amiDocSnap => {
          if (amiDocSnap.exists()) {
            const amiData = amiDocSnap.data();
            const updatedAmisData = {
              id: amiId,
              nom: amiData.nom,
              prenom: amiData.prenom,
              etat: amiData.etat
            };

            setAmisData(prevState => {
              const newState = prevState.filter(ami => ami.id !== amiId);
              return [...newState, updatedAmisData];
            });
          }
        });

        unsubscribeAmis.push(unsubscribe);
      });
    };

    if (amisIds.length > 0) {
      fetchAmisData();
    } else {
      setAmisData([]);
    }

    return () => {
      unsubscribeAmis.forEach(unsub => unsub());
    };
  }, [amisIds]);

  return (
    <div>
      <h2 style={{ fontStyle: 'italic', color: 'white' }}>Liste des contacts :</h2>
      <ul className='list-group'>
        {amisData.map(ami => (
          <li key={ami.id} style={{ fontStyle: 'italic' }} className='list-group-item'>
            {ami.nom} {ami.prenom} <i className="user outline icon"></i> {ami.etat ? (
              <span className='badge bg-success'>En ligne</span>
            ) : (
              <span className='badge bg-danger'>Absent</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Amis;
