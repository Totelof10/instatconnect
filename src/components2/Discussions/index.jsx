import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { getFirestore, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Discussions = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [userFriends, setUserFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const currentUser = firebaseAuth.currentUser;
  const storage = getStorage();

  useEffect(() => {
    const fetchUserFriends = async () => {
      try {
        const db = getFirestore();
        const friendsCollection = collection(db, 'users');
        const friendsQuery = query(friendsCollection, where('amis', 'array-contains', currentUser.uid));
        const friendsSnapshot = await getDocs(friendsQuery);
        const friendsData = friendsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserFriends(friendsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des contacts:', error);
      }
    };

    if (currentUser) {
      fetchUserFriends();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedFriend) {
      const db = getFirestore();
      const messagesCollection = collection(db, 'messages');
      const messagesQuery = query(messagesCollection, 
        where('senderId', 'in', [currentUser.uid, selectedFriend.id]),
        where('receiverId', 'in', [currentUser.uid, selectedFriend.id]),
        orderBy('timestamp', 'asc') // Tri des messages par ordre croissant de timestamp
      );
  
      // Écouter les changements dans la collection de messages
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => doc.data());
        setMessages(newMessages);
      });
  
      return () => unsubscribe();
    }
  }, [selectedFriend, currentUser]);

  const handleFriendClick = (friend) => {
    if (selectedFriend && selectedFriend.id === friend.id) {
      // Si l'ami cliqué est déjà ouvert, le fermer
      setSelectedFriend(null);
    } else {
      // Sinon, ouvrir l'ami cliqué
      setSelectedFriend(friend);
    }
  };

  const handleMessageInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    try {
      const db = getFirestore();
      const messagesCollection = collection(db, 'messages');

      // Créer un objet de message avec le contenu du message et le fichier sélectionné
      const messageObject = {
        senderId: currentUser.uid,
        receiverId: selectedFriend.id,
        message: messageInput,
        timestamp: serverTimestamp(),
        file: null // Par défaut, pas de fichier attaché
      };

      // S'il y a un fichier sélectionné, téléchargez-le d'abord dans le stockage Firebase
      if (selectedFile) {
        const storageRef = ref(storage, 'files/' + selectedFile.name);
        await uploadBytes(storageRef, selectedFile);
        const fileUrl = await getDownloadURL(storageRef);
        // Ajoutez le lien du fichier téléchargé à l'objet de message
        messageObject.file = fileUrl;
      }

      // Ajouter le message à la collection de messages
      await addDoc(messagesCollection, messageObject);

      // Réinitialiser les valeurs
      setMessageInput('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  return (
    <div className='container mt-5'>
      <h2 className='text-white'>Vos messages</h2>
      <div className="row">
        <div className="col-md-3 overflow-auto" style={{ maxHeight: '240px' }}>
          {userFriends.map(friend => (
            <div key={friend.id} className="card mb-3">
              <div className="card-body border" 
                   style={{ transition: 'border-color 0.2s' }}
                   onClick={() => handleFriendClick(friend)}
                   onMouseEnter={(event) => { event.target.parentNode.style.borderColor = 'blue'; }}
                   onMouseLeave={(event) => { event.target.parentNode.style.borderColor = 'transparent'; }}
              >
                <h5 className="card-title" style={{ cursor: 'pointer', display: 'flex' }}>
                  <img src={friend.profileImage} alt="Photo de profil de l'autre utilisateur" 
                       style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }} />
                  {friend.nom} {friend.prenom}
                </h5>
              </div>
            </div>
          ))}
        </div>
        <div className="col-md-9">
          {selectedFriend && (
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{selectedFriend.nom} {selectedFriend.prenom}</h5>
                <div className='container overflow-auto' style={{ maxHeight: '240px' }}>
                  {messages.map((msg, index) => (
                    <div key={index} className={`d-flex ${msg.senderId === currentUser.uid ? 'justify-content-end' : 'justify-content-start'}`}>
                      <div className={`message ${msg.senderId === currentUser.uid ? 'bg-primary-subtle text-black' : 'bg-light text-dark'} p-2 rounded mb-2`}>
                        <div style={{ display: 'flex' }}>
                          {msg.senderId !== currentUser.uid && (
                            <img src={selectedFriend.profileImage} alt="Photo de profil de l'autre utilisateur" 
                                 style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }} />
                          )}
                          <p className="mb-0">{msg.message}</p>
                          {msg.file && <a href={msg.file} className="text-decoration-none ms-2">Voir fichier</a>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage}>
                  <div className="mb-3">
                    <textarea className="form-control" rows="1" value={messageInput} onChange={handleMessageInputChange} placeholder='Nouveau message'></textarea>
                  </div>
                  <div className="mb-3">
                    <input type="file" className="form-control" onChange={handleFileInputChange} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={messageInput.trim() === '' && !selectedFile}>Envoyer</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discussions;
