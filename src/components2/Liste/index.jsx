import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Liste = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [addingFriend, setAddingFriend] = useState(false);
    const [removingFriend, setRemovingFriend] = useState(false);
    const [friendIds, setFriendIds] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const params = selectedDepartment ? `?departement=${selectedDepartment}` : '';
                const { data } = await api.get(`/auth/users/${params}`);
                setUsers(data);
            } catch (err) {
                console.error('Erreur lors de la récupération des utilisateurs:', err);
            }
        };
        fetchUsers();
    }, [selectedDepartment]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const { data } = await api.get('/auth/users/friends/');
                setFriendIds(data.map(f => f.id));
            } catch (err) {
                console.error('Erreur lors de la récupération des amis:', err);
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

    const filteredUsers = users.filter(user =>
        user.nom.toLowerCase().includes(searchUser.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchUser.toLowerCase())
    );

    return (
        <div className='container' style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <h2 style={{fontStyle:'italic', color:'white'}}>Liste des utilisateurs :</h2>
            <ToastContainer/>
            <input
                type="text"
                placeholder="Rechercher par nom"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className='form-control mb-3'
            />
            <select className='form-control' onChange={(e) => setSelectedDepartment(e.target.value)} name="departement" id='departement'>
                <option value="">Sélectionnez un département</option>
                <option value="CGP">CGP</option>
                <option value="DAAF">DAAF</option>
                <option value="DSIC">DSIC</option>
                <option value="DFRS">DFRS</option>
                <option value="DCNM">DCNM</option>
                <option value="DSCVM">DSCVM</option>
                <option value="DSE">DSE</option>
                <option value="DDSS">DDSS</option>
                <option value="DIR INTER">DIR INTER</option>
            </select>
            <div className='row'>
                <div className='container col-md-12'>
                    <ul className='list-group'>
                        {filteredUsers.map(user => (
                            <li key={user.id} className='list-group-item text-center'>
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <img src={user.profile_image} alt='photo de profil' style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                                    </div>
                                    <div className='col-md-2'>
                                        <strong>{user.nom} {user.prenom}</strong>
                                        <p>Département: <strong>{user.departement}</strong></p>
                                        <p>Email: <strong>{user.email}</strong></p>
                                        {user.id === currentUser?.id ? (
                                            <button className="btn btn-secondary" disabled>MOI</button>
                                        ) : (
                                            <button className="ui inverted blue button" onClick={() => handleShowProfile(user)}>Voir Profil</button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <Modal show={selectedUser !== null} onHide={handleCloseProfile}>
                <Modal.Header closeButton>
                    <Modal.Title>Informations sur l'utilisateur</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <>
                            {selectedUser.profile_image && (
                                <div className='text-center'>
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
}

export default Liste;
