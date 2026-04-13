import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { createWebSocket } from '../../services/websocket';

const DEPARTMENTS = ['CGP','DAAF','DSIC','DFRS','DCNM','DSCVM','DSE','DDSS','DIR INTER'];

const DiscuGroupe = (props) => {
  const { currentUser } = useAuth();
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);
  const userDepartement = props.userData?.departement;

  useEffect(() => {
    if (!userDepartement) return;
    const fetchDeptUsers = async () => {
      try {
        const { data } = await api.get(`/auth/users/?departement=${userDepartement}`);
        setDepartmentUsers(data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeptUsers();
  }, [userDepartement]);

  const handleJoinDiscussion = async (department) => {
    if (currentDepartment === department) {
      setCurrentDepartment(null);
      if (wsRef.current) wsRef.current.close();
      return;
    }
    setCurrentDepartment(department);

    try {
      const { data } = await api.get(`/group-messages/?department=${department}`);
      setMessages(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des messages:', err);
    }

    if (wsRef.current) wsRef.current.close();
    const ws = createWebSocket(`/ws/group/${department}/`);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
    };
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('department', currentDepartment);
      formData.append('message', messageInput);
      if (selectedFile) formData.append('file', selectedFile);
      await api.post('/group-messages/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessageInput('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
    }
  };

  return (
    <div className='container mt-5'>
      {loading ? (<div className='loader'></div>) : (
        <div>
          <h2 className='text-white mb-4'>Réunion du département</h2>
          {userDepartement && (
            <div className='row mb-4'>
              <h3 className='text-white mb-3'>Département {userDepartement}</h3>
              <div className='col-md-3 overflow-auto' style={{ maxHeight: '240px' }}>
                {departmentUsers.map(user => (
                  <div className='card mb-3' key={user.id}>
                    <div className='card-body'>
                      <h5 className='card-title d-flex align-items-center'>
                        <img src={user.profile_image} alt="Photo de profil" className='rounded-circle me-2' style={{ width: '30px', height: '30px' }} />
                        {user.nom} {user.prenom}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
              <div className='col-md-9'>
                <button className='ui inverted blue button' onClick={() => handleJoinDiscussion(userDepartement)}>
                  {currentDepartment === userDepartement ? 'Cacher la discussion' : 'Rejoindre la discussion'}
                </button>
                {currentDepartment === userDepartement && (
                  <div className='bg-white p-3 rounded mt-3'>
                    <div className='overflow-auto mb-3' style={{ maxHeight: '200px' }}>
                      {messages.map((msg, index) => {
                        const senderProfile = departmentUsers.find(u => u.id === msg.sender_id);
                        return (
                          <div key={index} className={`d-flex ${msg.sender_id === currentUser?.id ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                            <div className={`message p-2 rounded ${msg.sender_id === currentUser?.id ? 'bg-primary-subtle text-black' : 'bg-light text-dark'}`}>
                              <div className='d-flex align-items-center'>
                                {msg.sender_id !== currentUser?.id && senderProfile && (
                                  <div className='d-flex align-items-center me-2'>
                                    <img src={senderProfile.profile_image} alt="Photo de profil" className='rounded-circle me-2' style={{ width: '30px', height: '30px' }} />
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
                        <textarea className='form-control' rows='1' value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder='Nouveau message'></textarea>
                      </div>
                      <div className='mb-3'>
                        <input type='file' className='form-control' onChange={(e) => setSelectedFile(e.target.files[0])} />
                      </div>
                      <button type='submit' className='btn btn-primary' disabled={messageInput.trim() === '' && !selectedFile}>Envoyer</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscuGroupe;
