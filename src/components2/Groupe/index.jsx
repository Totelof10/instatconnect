import React, { useEffect, useState, useRef, useContext } from 'react';
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, orderBy } from 'firebase/firestore';
import { FirebaseContext } from '../../components/FireBase/firebase';

const DiscuGroupe = (props) => {
  const firebaseAuth = useContext(FirebaseContext)  
  const [groupDiscussions, setGroupDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [fileInput, setFileInput] = useState(null); // État pour stocker les fichiers sélectionnés
  const [messages, setMessages] = useState([]);
  const h3Ref = useRef(null); // Référence pour le h3
  const [isMouseOver, setIsMouseOver] = useState(false);
  const userData = props.userData;
  const currentUser = firebaseAuth.currentUser;

  useEffect(() => {
    const fetchGroupDiscussions = async () => {
      try {
        if (userData && userData.departement) { // Vérifier si userData et userData.departement sont définis
          const db = getFirestore();
          const usersCollection = collection(db, 'users');
          const usersQuery = query(usersCollection, where('departement', '==', userData.departement));
          const usersSnapshot = await getDocs(usersQuery);
          const users = usersSnapshot.docs.map(doc => doc.data());
          // Créer une discussion de groupe avec les utilisateurs du même département
          const departmentDiscussion = {
            department: userData.departement,
            users: users,
          };
          // Mettre à jour l'état avec la discussion de groupe
          setGroupDiscussions([departmentDiscussion]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs du département:', error);
      }
    };
  
    fetchGroupDiscussions();
  }, [userData]); // Exécuter uniquement lorsque userData change
  

  const handleGroupDiscussionClick = (discussion) => {
    setSelectedDiscussion(discussion);
  };

  const handleMessageInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  const handleFileInputChange = (event) => {
    // Mettre à jour l'état avec les fichiers sélectionnés
    setFileInput(event.target.files[0]);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    try {
      const db = getFirestore();
      const messagesCollection = collection(db, 'discugroupes');
      // Créer un objet de message avec le contenu du message et les fichiers sélectionnés
      const messageObject = {
        senderId: userData.id,
        department: selectedDiscussion.department,
        message: messageInput,
        file: fileInput, // Ajouter les fichiers au message
        timestamp: serverTimestamp(),
      };
      // Ajouter le message à la collection de messages
      await addDoc(messagesCollection, messageObject);
      // Réinitialiser les valeurs
      setMessageInput('');
      setFileInput(null);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  useEffect(() => {
    if (selectedDiscussion) {
      const db = getFirestore();
      const messagesCollection = collection(db, 'discugroupes');
      const messagesQuery = query(messagesCollection, where('department', '==', selectedDiscussion.department), orderBy('timestamp', 'asc'));
  
      // Écouter les changements dans la collection de messages de la discussion sélectionnée
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => doc.data());
        setMessages(newMessages);
      });
  
      return () => unsubscribe();
    }
  }, [selectedDiscussion]);
  

  useEffect(() => {
    // Mettre le focus sur le h3 lorsque la référence h3Ref est mise à jour
    if (h3Ref.current) {
      h3Ref.current.focus();
    }
  }, [h3Ref]);

  return (
    <div className='container'>
      <h2>Discussions de groupe par département</h2>
      <div className='row'>
        {groupDiscussions.map((discussion, index) => (
          <div key={index} className='col-md-6'>
            <h3
              ref={h3Ref} // Assigner la référence au h3
              onClick={() => handleGroupDiscussionClick(discussion)}
              onMouseEnter={() => setIsMouseOver(true)}
              onMouseLeave={() => setIsMouseOver(false)}
              style={{ cursor: 'pointer', backgroundColor: isMouseOver ? 'lightgray' : 'white' }}
              tabIndex="0" // Pour que le h3 puisse recevoir le focus
            >
              {discussion.department}
            </h3>
            <ul className='list-group'>
              {discussion.users.map((user, index) => (
                <li key={index} className='list-group-item'>{user.nom} {user.prenom}</li>
              ))}
            </ul>
          </div>
        ))}
        {selectedDiscussion && (
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{selectedDiscussion.department}</h5>
                {/* Afficher les messages ici */}
                <div className='container overflow-auto' style={{ maxHeight: '240px' }}>
                  {messages.map((msg, index) => (
                    <div key={index} className={`message-container ${msg.senderId === currentUser.uid ? 'message-right': 'message-left'}`}>
                      <div style={{display:'flex'}}>
                        {msg.senderId !== currentUser.uid && (
                            <img src={selectedDiscussion.profileImage} alt="Photo de profil" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px'}}/>
                        )}
                        <p className="message">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Formulaire de message */}
                <form onSubmit={handleSendMessage}>
                  <div className="mb-3">
                    <textarea className="form-control" rows="1" value={messageInput} onChange={handleMessageInputChange} placeholder='Nouveau message'></textarea>
                  </div>
                  <div className="mb-3">
                    <input type="file" onChange={handleFileInputChange} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={messageInput.trim() === ''}>Envoyer</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscuGroupe;
