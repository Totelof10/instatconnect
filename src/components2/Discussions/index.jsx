import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Discussions = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [userFriends, setUserFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const currentUser = firebaseAuth.currentUser;
  const storage = getStorage();

  useEffect(() => {
    const fetchUserFriends = () => {
      try {
        const db = getFirestore();
        const friendsCollection = collection(db, 'users');
        const friendsQuery = query(friendsCollection, where('amis', 'array-contains', currentUser.uid));

        const unsubscribe = onSnapshot(friendsQuery, (friendsSnapshot) => {
          const friendsData = friendsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserFriends(friendsData);
        }, (error) => {
          console.error('Erreur lors de la récupération des contacts:', error);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Erreur lors de la récupération des contacts:', error);
      }
    };

    if (currentUser) {
      const unsubscribe = fetchUserFriends();
      return () => unsubscribe && unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedFriend) {
      const db = getFirestore();
      const messagesCollection = collection(db, 'messages');
      const messagesQuery = query(messagesCollection, 
        where('senderId', 'in', [currentUser.uid, selectedFriend.id]),
        where('receiverId', 'in', [currentUser.uid, selectedFriend.id]),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => doc.data());
        setMessages(newMessages);
      });

      return () => unsubscribe();
    }
  }, [selectedFriend, currentUser]);

  const handleFriendClick = (friend) => {
    if (selectedFriend && selectedFriend.id === friend.id) {
      setSelectedFriend(null);
    } else {
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

      const messageObject = {
        senderId: currentUser.uid,
        receiverId: selectedFriend.id,
        message: messageInput,
        timestamp: serverTimestamp(),
        file: null
      };

      if (selectedFile) {
        const storageRef = ref(storage, 'files/' + selectedFile.name);
        await uploadBytes(storageRef, selectedFile);
        const fileUrl = await getDownloadURL(storageRef);
        messageObject.file = fileUrl;
      }

      await addDoc(messagesCollection, messageObject);

      setMessageInput('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const filteredFriends = userFriends.filter(friend => 
    friend.nom.toLowerCase().includes(searchInput.toLowerCase()) || 
    friend.prenom.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className='container mt-5'>
      <h2 className='text-white'>Vos messages</h2>
      <div className="row">
        <div className="col-md-3 overflow-auto">
        <input 
            type="text" 
            className="form-control mb-3" 
            placeholder="Rechercher des contacts" 
            value={searchInput} 
            onChange={handleSearchInputChange} 
          />
          <div style={{ maxHeight: '240px' }}>
            {filteredFriends.map(friend => (
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
                    {friend.nom} {friend.prenom} {friend.etat ? 
                    (<span className="position-absolute top-2 start-100 translate-middle p-2 bg-success border border-light rounded-circle"></span>)
                    :
                    (<span className="position-absolute top-2 start-100 translate-middle p-2 bg-danger border border-light rounded-circle"></span>)}
                  </h5>
                </div>
              </div>
            ))}
          </div>
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
                          {msg.file && <a href={msg.file} className="text-decoration-none ms-2">Voir le fichier</a>}
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
