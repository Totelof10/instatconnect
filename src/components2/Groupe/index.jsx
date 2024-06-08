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
  const [loading, setLoading] = useState(true)
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
        setLoading(false)
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
    <div className='container mt-5'>
      {loading ? (<div className='loader'></div>):(
      <div>
        <h2 className='text-white mb-4'>Réunion du département</h2>
        {Object.entries(departmentDiscussions).map(([department, users]) => (
          department === userDepartement && (
            <div key={department} className='row mb-4'>
              <h3 className='text-white mb-3'>Département {department}</h3>
              <div className='col-md-3 overflow-auto' style={{ maxHeight: '240px' }}>
                {users.map(user => (
                  <div className='card mb-3' key={user.id}>
                    <div className='card-body'>
                      <h5 className='card-title d-flex align-items-center'>
                        <img src={user.profileImage} alt="Photo de profil de l'utilisateur" className='rounded-circle me-2' style={{ width: '30px', height: '30px' }} />
                        {user.nom} {user.prenom}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
              <div className='col-md-9'>
                <button className='ui inverted blue button' onClick={() => handleJoinDiscussion(department)}>
                  {currentDepartment === department ? 'Cacher la discussion' : 'Rejoindre la discussion'}
                </button>
                {currentDepartment === department && (
                  <div className='bg-white p-3 rounded mt-3'>
                    <div className='overflow-auto mb-3' style={{ maxHeight: '200px' }}>
                      {messages.map((msg, index) => {
                        const senderProfile = departmentDiscussions[currentDepartment].find(user => user.id === msg.senderId);
                        return (
                          <div key={index} className={`d-flex ${msg.senderId === currentUser.uid ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                            <div className={`message p-2 rounded ${msg.senderId === currentUser.uid ? 'bg-primary-subtle text-black' : 'bg-light text-dark'}`}>
                              <div className='d-flex align-items-center'>
                                {msg.senderId !== currentUser.uid && (
                                  <div className='d-flex align-items-center me-2'>
                                    <img src={senderProfile.profileImage} alt="Photo de profil de l'utilisateur" className='rounded-circle me-2' style={{ width: '30px', height: '30px' }} />
                                    <p className='mb-0'><strong>{senderProfile.prenom}</strong></p>
                                  </div>
                                )}
                                <p className='mb-0'>{msg.message}</p>
                                {msg.file && <a href={msg.file} className='ms-2 text-decoration-none'>Voir le fichier</a>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <form onSubmit={handleSendMessage}>
                      <div className='mb-3'>
                        <textarea className='form-control' rows='1' value={messageInput} onChange={handleMessageInputChange} placeholder='Nouveau message'></textarea>
                      </div>
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
        )}
    </div>
  );
};

export default DiscuGroupe;
