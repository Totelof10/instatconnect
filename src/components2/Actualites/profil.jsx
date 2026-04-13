import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Profil = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addingFriend, setAddingFriend] = useState(false);
  const [removingFriend, setRemovingFriend] = useState(false);
  const [friendIds, setFriendIds] = useState([]);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const { data } = await api.get('/auth/users/online/');
        setUsers(data.filter(u => u.id !== currentUser?.id));
      } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs en ligne :', err);
      }
    };
    fetchOnlineUsers();
  }, [currentUser]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const { data } = await api.get('/auth/users/friends/');
        setFriendIds(data.map(f => f.id));
      } catch (err) {
        console.error('Erreur lors de la récupération des amis :', err);
      }
    };
    fetchFriends();
  }, []);

  const handleShowProfile = (user) => {
    setSelectedUser(user);
  };

  const handleCloseProfile = () => {
    setSelectedUser(null);
  };

  const handleAddFriend = async () => {
    setAddingFriend(true);
    try {
      await api.post(`/auth/users/${selectedUser.id}/friend/`);
      setFriendIds(prev => [...prev, selectedUser.id]);
      toast.info('Ajout réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setAddingFriend(false);
    }
  };

  const handleRemoveFriend = async () => {
    setRemovingFriend(true);
    try {
      await api.delete(`/auth/users/${selectedUser.id}/friend/`);
      setFriendIds(prev => prev.filter(id => id !== selectedUser.id));
      toast.info('Retrait réussi');
    } catch (error) {
      toast.error('Erreur lors du retrait');
    } finally {
      setRemovingFriend(false);
    }
  };

  const areFriends = selectedUser && friendIds.includes(selectedUser.id);

  return (
    <div className="container">
      <h2 style={{ fontStyle: 'italic', color: 'white' }}>Liste des utilisateurs connectés :</h2>
      <ToastContainer />
      <div>
        {users.map(user => (
          <div key={user.id}>
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title">{user.nom} {user.prenom}</h5>
                <p className="card-text">Email: <strong>{user.email}</strong></p>
                <p className="card-text">Département: <strong>{user.departement}</strong></p>
                <span className='position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle'></span>
                <button className="btn btn-primary" onClick={() => handleShowProfile(user)}>Voir Profil</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={selectedUser !== null} onHide={handleCloseProfile}>
        <Modal.Header closeButton>
          <Modal.Title>Informations sur l'utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              {selectedUser.profile_image && (
                <div className='text-center mb-3'>
                  <img src={selectedUser.profile_image} alt="Photo de profil" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
              )}
              <p><strong>{selectedUser.nom} {selectedUser.prenom}</strong></p>
              <p>Email: <strong>{selectedUser.email}</strong></p>
              <p>Département: <strong>{selectedUser.departement}</strong></p>
              <p>Numéro téléphone: <strong>{selectedUser.numero_telephone}</strong></p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between align-items-center">
          {areFriends ? (
            <>
              <button className='btn btn-danger me-2' onClick={handleRemoveFriend} disabled={removingFriend}>
                {removingFriend ? 'Retrait en cours...' : 'Retirer'}
              </button>
              <Link to='/welcome/discussions'>
                <i className="paper plane outline icon big" type='button'></i>
              </Link>
            </>
          ) : (
            <button className='btn btn-success me-auto' onClick={handleAddFriend} disabled={addingFriend}>
              {addingFriend ? 'Ajout en cours...' : 'Contacter'}
            </button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profil;
