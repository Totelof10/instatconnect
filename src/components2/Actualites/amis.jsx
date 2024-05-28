import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { getFirestore, onSnapshot, doc, getDoc } from 'firebase/firestore';

const Amis = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [amisIds, setAmisIds] = useState([]);
  const [amisData, setAmisData] = useState([]);
  const currentUser = firebaseAuth.currentUser;

  useEffect(() => {
    const fetchAmisIds = async () => {
      if (currentUser) {
        const db = getFirestore();
        const userDocRef = doc(db, 'users', currentUser.uid);

        const unsubscribe = onSnapshot(userDocRef, snapshot => {
          const userData = snapshot.data();
          if (userData && userData.amis) {
            setAmisIds(userData.amis);
          }
        });

        return () => unsubscribe();
      }
    };

    fetchAmisIds();
  }, [currentUser]);

  useEffect(() => {
    const fetchAmisData = async () => {
      const db = getFirestore();
      const amisData = await Promise.all(
        amisIds.map(async amiId => {
          const amiDocRef = doc(db, 'users', amiId);
          const amiDocSnap = await getDoc(amiDocRef);
          if (amiDocSnap.exists()) {
            const amiData = amiDocSnap.data();
            return { id: amiId, nom: amiData.nom, prenom: amiData.prenom };
          }
          return null;
        })
      );
      setAmisData(amisData.filter(Boolean)); // Filtrer les amis non trouvés
    };

    fetchAmisData();
  }, [amisIds]);

  return (
    <div>
      <h2 style={{fontStyle:'italic', color:'white'}}>Liste des contacts :</h2>
      <ul className='list-group'>
        {amisData.map(ami => (
          <li key={ami.id} style={{fontStyle:'italic'}} className='list-group-item'>
            {ami.nom} {ami.prenom} <i class="user outline icon"></i>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Amis;
