import React, { useContext, useEffect, useState } from 'react'
import { getFirestore, collection, getDocs } from "firebase/firestore"
import { FirebaseContext } from '../../components/FireBase/firebase'

const Liste = () => {
    const db = getFirestore()
    const firebaseAuth = useContext(FirebaseContext)
    const [users, setUsers] = useState([])
    const [selectedDepartment, setSelectedDepartment] = useState('') // État pour stocker le département sélectionné

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Récupérer la référence de la collection "users"
                const usersCollection = collection(db, 'users')

                // Récupérer tous les documents de la collection "users"
                const usersSnapshot = await getDocs(usersCollection)

                // Initialiser un tableau pour stocker les utilisateurs
                let usersData = []

                // Parcourir chaque document dans la collection "users"
                usersSnapshot.forEach(doc => {
                    // Récupérer les données de chaque document et les ajouter au tableau
                    usersData.push({ id: doc.id, ...doc.data() })
                })

                // Trier les utilisateurs par ordre alphabétique du nom
                usersData.sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom))

                // Si un département est sélectionné, filtrer les utilisateurs par ce département
                if (selectedDepartment) {
                    usersData = usersData.filter(user => user.departement === selectedDepartment)
                }

                // Mettre à jour l'état local avec les utilisateurs triés et filtrés
                setUsers(usersData)
            } catch (error) {
                console.error('Erreur lors de la récupération des utilisateurs:', error)
            }
        }

        // Appeler la fonction fetchUsers lors du montage du composant et à chaque changement de département sélectionné
        fetchUsers()
    }, [db, selectedDepartment]) // Ajouter selectedDepartment à la liste de dépendances

    // Fonction pour gérer le changement de département sélectionné
    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value)
    }

    return (
        <div className='container' style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <h2 style={{textDecorationColor:'white'}}>Liste des utilisateurs :</h2>
            {/* Sélecteur pour choisir le département */}
            <select  className='form-control' onChange={handleDepartmentChange} name="departement" id='departement' required>
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
                {/* Ajoutez d'autres options pour d'autres départements */}
              </select>
            <div className='row'>
                <div className='container col-md-12'>
                    <ul className='list-group'>
                    {/* Afficher la liste des utilisateurs */}
                        {users.map(user => (
                            <li key={user.id} className='list-group-item text-center'>
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <img src={user.profileImage} alt='photo de profil' style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}/>
                                    </div>
                                    <div className='col-md-2'>
                                        <strong>{user.nom} {user.prenom}</strong>
                                        <p>Département: <strong>{user.departement}</strong></p>
                                        <p>Email: <strong>{user.email}</strong></p>
                                    </div>  
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Liste
