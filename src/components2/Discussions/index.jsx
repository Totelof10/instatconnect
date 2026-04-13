import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { createWebSocket } from '../../services/websocket';

const Discussions = () => {
  const { currentUser } = useAuth();
  const [userFriends, setUserFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const wsRef = useRef(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const { data } = await api.get('/auth/users/friends/');
        setUserFriends(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des contacts:', err);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!selectedFriend) return;

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/messages/?friend_id=${selectedFriend.id}`);
        setMessages(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des messages:', err);
      }
    };
    fetchMessages();

    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = createWebSocket(`/ws/messages/${selectedFriend.id}/`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
    };

    return () => {
      ws.close();
    };
  }, [selectedFriend]);

  const handleFriendClick = (friend) => {
    if (selectedFriend && selectedFriend.id === friend.id) {
      setSelectedFriend(null);
    } else {
      setSelectedFriend(friend);
      setMessages([]);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('receiver_id', selectedFriend.id);
      formData.append('message', messageInput);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      await api.post('/messages/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessageInput('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
    }
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
            onChange={(e) => setSearchInput(e.target.value)}
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
                    <img src={friend.profile_image} alt="Photo de profil"
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
                    <div key={index} className={`d-flex ${msg.sender_id === currentUser?.id ? 'justify-content-end' : 'justify-content-start'}`}>
                      <div className={`message ${msg.sender_id === currentUser?.id ? 'bg-primary-subtle text-black' : 'bg-light text-dark'} p-2 rounded mb-2`}>
                        <div style={{ display: 'flex' }}>
                          {msg.sender_id !== currentUser?.id && (
                            <img src={selectedFriend.profile_image} alt="Photo de profil"
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
                    <textarea className="form-control" rows="1" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder='Nouveau message'></textarea>
                  </div>
                  <div className="mb-3">
                    <input type="file" className="form-control" onChange={(e) => setSelectedFile(e.target.files[0])} />
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
