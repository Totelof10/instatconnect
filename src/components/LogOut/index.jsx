import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../FireBase/firebase';
import { signOut } from 'firebase/auth';

const LogOut = () => {
    const [checked, setChecked] = useState(false);
    const firebaseAuth = useContext(FirebaseContext);

    useEffect(() => {
        if (checked) {
            console.log("Déconnexion");
            signOut(firebaseAuth)
                .then(() => {
                    alert('Utilisateur déconnecté avec succès')
                    console.log("Utilisateur déconnecté avec succès");
                })
                .catch((error) => {
                    console.error("Erreur lors de la déconnexion :", error);
                });
        }
    }, [checked, firebaseAuth]);

    const handleChange = (e) => {
        setChecked(e.target.checked);
    };

    return (
        <div className='logout-container'>
            <label className="switch">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                />
                <span className="slider round"></span>
            </label>
        </div>
    );
};

export default LogOut;
