import React, { useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const Edit = (props) => {
  const userData = props.userData;
  const [formData, setFormData] = useState({
    nom: userData ? userData.nom : '',
    prenom: userData ? userData.prenom : '',
    email: userData ? userData.email : '',
    numeroTelephone: userData ? userData.numeroTelephone : '',
    departement: userData ? userData.departement : ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', userData.id);
      await setDoc(userDocRef, formData, { merge: true });
      console.log('Données utilisateur mises à jour avec succès !');
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données utilisateur :', error);
    }
  };

  return (
    <div className="container mt-4">
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="form-group">
          <label htmlFor="nom" style={{color:'black'}}>Nom</label>
          <input
            type="text"
            className="form-control"
            id="nom"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="prenom" style={{color:'black'}}>Prénom(s)</label>
          <input
            type="text"
            className="form-control"
            id="prenom"
            name="prenom"
            placeholder="Prénom(s)"
            value={formData.prenom}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" style={{color:'black'}}>Adresse email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="numeroTelephone" style={{color:'black'}}>Numéro de téléphone</label>
          <input
            type="tel"
            className="form-control"
            id="numeroTelephone"
            name="numeroTelephone"
            placeholder="Numéro de téléphone"
            value={formData.numeroTelephone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="departement" style={{color:'black'}}>Département</label>
          <select
            className="form-control"
            id="departement"
            name="departement"
            value={formData.departement}
            onChange={handleChange}
            disabled
            required
          >
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
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Sauvegarder les modifications
        </button>
      </form>
    </div>
  );
};

export default Edit;
