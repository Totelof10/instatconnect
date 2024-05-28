import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { getFirestore, collection, getDocs, query, orderBy, where, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DiscuGroupe = (props) => {
  const firebaseAuth = useContext(FirebaseContext);
  const [departmentDiscussions, setDepartmentDiscussions] = useState({});
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const currentUser = firebaseAuth.currentUser;
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchDepartmentDiscussions = async () => {
      try {
        // Récupérer la liste des départements disponibles
        const departmentsQuery = query(collection(db, 'users'), orderBy('departement'));
        const departmentDocs = await getDocs(departmentsQuery);
        const departments = [];
        departmentDocs.forEach(doc => {
          const data = doc.data();
          if (!departments.includes(data.departement)) {
            departments.push(data.departement);
          }
        });

        // Créer des discussions de groupe pour chaque département
        const departmentDiscussionsObj = {};
        for (const department of departments) {
          const usersQuery = query(collection(db, 'users'), where('departement', '==', department));
          const usersSnapshot = await getDocs(usersQuery);
          const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), profileImage: doc.data().profileImage }));
          departmentDiscussionsObj[department] = usersData;
        }
        setDepartmentDiscussions(departmentDiscussionsObj);
      } catch (error) {
        console.error('Erreur lors de la récupération des discussions de groupe:', error);
      }
    };

    fetchDepartmentDiscussions();
  }, [db]);

  const handleJoinDiscussion = async (department) => {
    if (currentDepartment === department) {
      setCurrentDepartment(null); // Masquer la discussion si elle est déjà affichée
    } else {
      setCurrentDepartment(department); // Afficher la discussion pour le département sélectionné

      // Récupérer les messages existants pour ce département
      const messagesCollection = collection(db, `group_messages/${department}/messages`);
      const messagesQuery = query(messagesCollection, orderBy('timestamp', 'asc'));
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => doc.data());
        setMessages(newMessages);
      });
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
      const messagesCollection = collection(db, `group_messages/${currentDepartment}/messages`);

      // Créer un objet de message avec le contenu du message et le fichier sélectionné
      const messageObject = {
        senderId: currentUser.uid,
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

  const userDepartement = props.userData.departement;

  return (
    <div className='container'>
      <h2 style={{ fontStyle: 'italic', color: 'white' }}>Réunion du département</h2>
      {Object.entries(departmentDiscussions).map(([department, users]) => (
        department === userDepartement && (
          <div key={department} className='row'>
            <h3 style={{ fontStyle: 'italic', color: 'white' }}>Département {department}</h3>
            <div className='col-md-3' style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {users.map(user => (
                <div className='card mb-3' key={user.id}>
                  <div className='card-body'>
                    <h5 className='card-title' style={{display:'flex'}}> 
                    <img src={user.profileImage} alt="Photo de profil de l'autre utilisateur" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px'}} />

                    {user.nom} {user.prenom}</h5>
                    {/* Autres informations sur l'utilisateur ici */}
                  </div>
                </div>
              ))}
            </div>
            <div className='col-md-9'>
              <button className='btn btn-primary' onClick={() => handleJoinDiscussion(department)}>
                {currentDepartment === department ? 'Cacher la discussion' : 'Rejoindre la discussion'}
              </button>
              {currentDepartment === department && (
                <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                  <div className='container overflow-auto' style={{ maxHeight: '200px' }}>
                    {messages.map((msg, index) => {
                      const senderProfile = departmentDiscussions[currentDepartment].find(user => user.id === msg.senderId);
                      return (
                        <div key={index} className={`message-container ${msg.senderId === currentUser.uid ? 'message-right' : 'message-left'}`}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {senderProfile.id !== currentUser.uid && (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src={senderProfile.profileImage} alt="Photo de profil de l'utilisateur" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }} />
                                <p><strong>{senderProfile.prenom}</strong></p>
                              </div>
                            )}
                            <p className="message" style={{ margin: '0 10px' }}>{msg.message}</p>
                            {msg.file && <a href={msg.file}>{msg.file}</a>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <form onSubmit={handleSendMessage}>
                    <div className='mb-3'>
                      <textarea className='form-control' rows='1' value={messageInput} onChange={handleMessageInputChange} placeholder='Nouveau message'></textarea>
                    </div>
                    {/* Champ d'entrée pour les fichiers */}
                    <div className='mb-3'>
                      <input type='file' className='form-control' onChange={handleFileInputChange} />
                    </div>
                    <button type='submit' className='btn btn-primary' disabled={messageInput.trim() === '' && !selectedFile}>Envoyer</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default DiscuGroupe;
