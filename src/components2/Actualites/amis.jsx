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
      <h2>Liste des amis :</h2>
      <ul>
        {amisData.map(ami => (
          <li key={ami.id}>
            {ami.nom} {ami.prenom}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Amis;
