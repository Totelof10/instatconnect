import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Edit = (props) => {
  const userData = props.userData;
  const { refreshCurrentUser } = useAuth();
  const [formData, setFormData] = useState({
    nom: userData ? userData.nom : '',
    prenom: userData ? userData.prenom : '',
    email: userData ? userData.email : '',
    numero_telephone: userData ? userData.numero_telephone : '',
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
      await api.patch('/auth/users/me/', {
        nom: formData.nom,
        prenom: formData.prenom,
        numero_telephone: formData.numero_telephone,
      });
      await refreshCurrentUser();
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
          <label htmlFor="numero_telephone" style={{color:'black'}}>Numéro de téléphone</label>
          <input
            type="tel"
            className="form-control"
            id="numero_telephone"
            name="numero_telephone"
            placeholder="Numéro de téléphone"
            value={formData.numero_telephone}
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
