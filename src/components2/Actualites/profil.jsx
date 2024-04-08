import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { getFirestore, getDoc, getDocs, collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore';

const Profil = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [currentUserFriends, setCurrentUserFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [senderNames, setSenderNames] = useState({});
  const [showAcceptRejectButtons, setShowAcceptRejectButtons] = useState(true)
  const currentUser = firebaseAuth.currentUser;
  const senderId = currentUser.uid;

  useEffect(() => {
    const fetchSenderNames = async () => {
      const names = {};
      for (const request of friendRequests) {
        try {
          if (request.senderId) { // Vérifier si senderId est défini
            const db = getFirestore();
            const senderDocRef = doc(db, 'users', request.senderId);
            const senderDocSnap = await getDoc(senderDocRef);
            if (senderDocSnap.exists()) {
              const senderData = senderDocSnap.data();
              const senderName = `${senderData.nom} ${senderData.prenom}`;
              names[request.id] = senderName;
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du nom de l\'expéditeur:', error);
        }
      }
      setSenderNames(names);
    };

    fetchSenderNames();
  }, [friendRequests]);

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

  useEffect(() => {
    const db = getFirestore();
    const friendRequestsCollection = collection(db, 'friendRequests');
    const requestsQuery = query(friendRequestsCollection, where('receiverId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(requestsQuery, snapshot => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriendRequests(requestsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      setIsFriend(currentUserFriends.includes(selectedUser.id));
    }
  }, [currentUserFriends, selectedUser, currentUser]);

  const openOffcanvas = (user) => {
    setSelectedUser(user);
    setOffcanvasOpen(true);
  };

  const closeOffcanvas = () => {
    setSelectedUser(null);
    setOffcanvasOpen(false);
  };

  useEffect(() => {
    if (selectedUser && currentUser && currentUserFriends.length > 0) {
      setIsFriend(currentUserFriends.includes(selectedUser.id));
    }
  }, [currentUserFriends, selectedUser, currentUser]);

  const toggleFriendship = async () => {
    if (!selectedUser || !selectedUser.id) {
      console.error('Erreur: Aucun utilisateur sélectionné');
      return;
    }
    const db = getFirestore();
    const userDocRef = doc(db, 'users', currentUser.uid);
    const selectedUserDocRef = doc(db, 'users', selectedUser.id); // Ajout du document de l'utilisateur sélectionné
  
    try {
      if (isFriend) {
        // Retirer l'utilisateur sélectionné de la liste d'amis de l'utilisateur actuel
        await updateDoc(userDocRef, {
          amis: arrayRemove(selectedUser.id)
        });
        console.log('Utilisateur retiré de la liste d\'amis avec succès');
  
        // Retirer l'utilisateur actuel de la liste d'amis de l'utilisateur sélectionné
        await updateDoc(selectedUserDocRef, {
          amis: arrayRemove(currentUser.uid)
        });
        console.log('Utilisateur actuel retiré de la liste d\'amis de l\'utilisateur sélectionné');
      } else {
        // Envoyer une demande d'ami
        const existingRequestQuery = query(collection(db, 'friendRequests'), where('senderId', '==', currentUser.uid), where('receiverId', '==', selectedUser.id));
        const existingRequestSnapshot = await getDocs(existingRequestQuery);
  
        if (!existingRequestSnapshot.empty) {
          console.log('Une demande d\'ami existe déjà entre ces utilisateurs');
          return;
        }
  
        await addDoc(collection(db, 'friendRequests'), {
          senderId: currentUser.uid,
          receiverId: selectedUser.id,
          createdAt: serverTimestamp()
        });
  
        console.log('Demande d\'ami envoyée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'amitié:', error);
    }
  }
  

    const acceptFriendRequest = async (requestId, senderId) => {
      if (!senderId) {
          console.error('Erreur : senderId est undefined');
          return;
      }
      const db = getFirestore();
      const requestDocRef = doc(db, 'friendRequests', requestId);
      const senderDocRef = doc(db, 'users', senderId);
      const currentUserDocRef = doc(db, 'users', currentUser.uid);

      try {
          // Mettre à jour le statut de la demande d'ami à 'accepted'
          await updateDoc(requestDocRef, {
              status: 'accepted'
          });

          // Récupérer les données de l'expéditeur de la demande
          const senderDocSnap = await getDoc(senderDocRef);

          if (senderDocSnap.exists()) {
              const senderData = senderDocSnap.data();
              const senderName = `${senderData.nom} ${senderData.prenom}`;
              console.log('Demande d\'ami acceptée de:', senderName);

              // Mettre à jour la liste d'amis de l'utilisateur actuel avec l'ID de l'expéditeur
              await updateDoc(currentUserDocRef, {
                  amis: arrayUnion(senderId)
              });

              console.log(`L'utilisateur actuel est maintenant ami avec ${senderName}`);

              // Mettre à jour la liste d'amis de l'expéditeur avec l'ID de l'utilisateur actuel
              await updateDoc(senderDocRef, {
                  amis: arrayUnion(currentUser.uid)
              });

              console.log(`${senderName} est maintenant ami avec l'utilisateur actuel`);
          } else {
              console.log("Le document de l'expéditeur n'existe pas.");
          }
      } catch (error) {
          console.error('Erreur lors de l\'acceptation de la demande d\'ami:', error);
      }
  }


  const rejectFriendRequest = async (requestId, senderId) => {
    const db = getFirestore();
    const requestDocRef = doc(db, 'friendRequests', requestId);

    try {
        // Mettre à jour le statut de la demande d'ami à 'rejected'
        await updateDoc(requestDocRef, {
            status: 'rejected'
        });

        // Supprimer la demande d'ami rejetée de la collection
        await deleteDoc(requestDocRef);

        if (senderId) {
            const senderDocRef = doc(db, 'users', senderId);
            const senderDocSnap = await getDoc(senderDocRef);

            if (senderDocSnap.exists()) {
                const senderData = senderDocSnap.data();
                const senderName = `${senderData.nom} ${senderData.prenom}`;
                console.log('Demande d\'ami rejetée de:', senderName);
            } else {
                console.log("Le document de l'expéditeur n'existe pas.");
            }
        }
    } catch (error) {
        console.error('Erreur lors du rejet de la demande d\'ami:', error);
    }
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
            {friendRequests.map(request => (
              <div key={request.id}>
                <p>Demande d'ami reçue de: <strong>{senderNames[request.id]}</strong></p>
                <button className="btn btn-success" onClick={() => acceptFriendRequest(request.id, request.senderId)}>Accepter</button>
                <button className="btn btn-danger" onClick={() => rejectFriendRequest(request.id, request.senderId)}>Rejeter</button>
              </div>
            ))}
            {selectedUser.id !== currentUser.uid && ( // Vérifier que l'utilisateur sélectionné n'est pas l'utilisateur actuel
              <>
                {isFriend ? ( // Vérifier si les utilisateurs sont amis
                  <button className='btn btn-danger' onClick={toggleFriendship}>Retirer amis</button>
                ) : (
                  <button className='btn btn-success' onClick={toggleFriendship}>Ajouter amis</button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;