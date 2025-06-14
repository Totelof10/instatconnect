import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { Link } from 'react-router-dom';
import { getFirestore, onSnapshot, collection, query, where, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Liste = () => {
    const db = getFirestore();
    const firebaseAuth = useContext(FirebaseContext);
    const [users, setUsers] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [addingFriend, setAddingFriend] = useState(false);
    const [removingFriend, setRemovingFriend] = useState(false);
    const [currentUserFriends, setCurrentUserFriends] = useState([]);
    const currentUser = firebaseAuth.currentUser;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'users');
                let usersQuery;
                if (selectedDepartment) {
                    usersQuery = query(usersCollection, where('departement', '==', selectedDepartment));
                } else {
                    usersQuery = query(usersCollection);
                }

                const unsubscribe = onSnapshot(usersQuery, snapshot => {
                    const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setUsers(usersData);
                });
                return () => unsubscribe();
            } catch (error) {
                console.error('Erreur lors de la récupération des utilisateurs:', error);
            }
        };
        fetchUsers();
    }, [db, selectedDepartment]);

    useEffect(() => {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userDocRef, snapshot => {
            const userData = snapshot.data();
            if (userData && userData.amis) {
                setCurrentUserFriends(userData.amis);
            }
        });
        return () => unsubscribe();
    }, [db, currentUser]);

    const handleShowProfile = (user) => {
        setSelectedUser(user);
    };

    const handleCloseProfile = () => {
        setSelectedUser(null);
    };

    const handleAddFriend = async () => {
        setAddingFriend(true);
        const currentUserDocRef = doc(db, 'users', currentUser.uid);
        const selectedUserDocRef = doc(db, 'users', selectedUser.id);

        try {
            await updateDoc(currentUserDocRef, { amis: arrayUnion(selectedUser.id) });
            await updateDoc(selectedUserDocRef, { amis: arrayUnion(currentUser.uid) });
            console.log('Utilisateur ajouté comme ami avec succès');
            setAddingFriend(false);
            toast.info('Ajout réussi')
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'ami:', error);
            setAddingFriend(false);
            toast.error('Erreur:' ,error)
        }
    };

    const handleRemoveFriend = async () => {
        setRemovingFriend(true);
        const currentUserDocRef = doc(db, 'users', currentUser.uid);
        const selectedUserDocRef = doc(db, 'users', selectedUser.id);

        try {
            await updateDoc(currentUserDocRef, { amis: arrayRemove(selectedUser.id) });
            await updateDoc(selectedUserDocRef, { amis: arrayRemove(currentUser.uid) });
            console.log('Ami retiré avec succès');
            setRemovingFriend(false);
            toast.info('Retrait réussi')
        } catch (error) {
            console.error('Erreur lors du retrait d\'ami:', error);
            setRemovingFriend(false);
            toast.error('Erreur:', error)
        }
    };

    const areFriends = selectedUser && currentUserFriends.includes(selectedUser.id);

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
    };

    const handleSearchInputChange = (event) => {
        setSearchUser(event.target.value);
    };

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
                onChange={handleSearchInputChange}
                className='form-control mb-3'
            />
            <select className='form-control' onChange={handleDepartmentChange} name="departement" id='departement' required>
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
                                        <img src={user.profileImage} alt='photo de profil' style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                                    </div>
                                    <div className='col-md-2'>
                                        <strong>{user.nom} {user.prenom}</strong>
                                        <p>Département: <strong>{user.departement}</strong></p>
                                        <p>Email: <strong>{user.email}</strong></p>
                                        {user.id === currentUser.uid ? (
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
                            {selectedUser.profileImage && (
                                <div className='text-center'>
                                    <img src={selectedUser.profileImage} alt="Photo de profil" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                                </div>
                            )}
                            <p><strong>{selectedUser.nom} {selectedUser.prenom}</strong></p>
                            <p>Email: <strong>{selectedUser.email}</strong></p>
                            <p>Département: <strong>{selectedUser.departement}</strong></p>
                            <p>Numéro téléphone: <strong>{selectedUser.numeroTelephone}</strong></p>
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
