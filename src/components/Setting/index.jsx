import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Edit from '../../components2/Edit';

const Setting = () => {
  const navigateTo = useNavigate();
  const { currentUser, loading, refreshCurrentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputFileRef = useRef(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigateTo('/');
    }
  }, [loading, currentUser, navigateTo]);

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profile_image', file);
      await api.post('/auth/users/me/photo/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshCurrentUser();
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image :', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading || !currentUser) return null;

  const userData = currentUser;

  return (
    <div className="container mt-5">
      {userData.profile_image && (
        <div className="text-center mb-4">
          {uploading ? (
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <img
              src={userData.profile_image}
              alt="Photo de profil"
              className="rounded-circle border border-primary"
              style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => inputFileRef.current.click()}
            />
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={inputFileRef}
            onChange={handleProfileImageChange}
          />
        </div>
      )}
      <ul className="list-group text-center">
        <li className="list-group-item"><strong>Nom:</strong> {userData.nom}</li>
        <li className="list-group-item"><strong>Prénom(s):</strong> {userData.prenom}</li>
        <li className="list-group-item"><strong>Adresse email:</strong> {userData.email}</li>
        <li className="list-group-item"><strong>Département:</strong> {userData.departement}</li>
        <li className="list-group-item"><strong>Numéro de téléphone:</strong> {userData.numero_telephone}</li>
      </ul>
      <div className="text-center mt-4">
        <button className="btn btn-warning" data-bs-toggle="offcanvas" data-bs-target="#editOffcanvas">
          <strong>Modifier </strong>
          <i className="fas fa-edit"></i>
        </button>
      </div>

      <div className="offcanvas offcanvas-end" tabIndex="-1" id="editOffcanvas">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasRightLabel">Modifier les informations</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <Edit userData={userData} />
        </div>
      </div>
    </div>
  );
};

export default Setting;
