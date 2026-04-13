import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DocumentPublic = (props) => {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [shareOption, setShareOption] = useState('public');
  const [filterDate, setFilterDate] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const params = filterDate ? `?filterDate=${filterDate}` : '';
        const { data } = await api.get(`/public-files/${params}`);
        setFiles(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des fichiers:', error);
      }
    };
    fetchFiles();
  }, [filterDate]);

  const handleAddFile = async (e) => {
    e.preventDefault();
    try {
      if (selectedFiles.length > 0) {
        const uploaded = await Promise.all(selectedFiles.map(async file => {
          const formData = new FormData();
          formData.append('name', file.name);
          formData.append('file', file);
          let department = null;
          if (shareOption === 'department') {
            department = props.userData?.departement || currentUser?.departement;
          } else if (shareOption === 'otherDepartment') {
            department = selectedDepartment;
          }
          if (department) formData.append('department', department);
          const { data } = await api.post('/public-files/', formData);
          return data;
        }));
        setFiles(prev => [...prev, ...uploaded]);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du fichier:', error);
    }
  };

  const handleDeleteFile = async (id, createdById) => {
    try {
      if (currentUser?.id === createdById) {
        await api.delete(`/public-files/${id}/`);
        setFiles(prev => prev.filter(file => file.id !== id));
      } else {
        console.error('Vous n\'êtes pas autorisé à supprimer ce fichier');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleDownloadFile = (url) => {
    window.open(url, '_blank');
  };

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleShareOptionChange = (event) => {
    setShareOption(event.target.value);
  };

  const handleFilterDateChange = (event) => {
    setFilterDate(event.target.value);
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const userDepartement = props.userData?.departement || currentUser?.departement;

  let filteredFiles = files;
  if (shareOption === 'public') {
    filteredFiles = files.filter(file => !file.department);
  } else if (shareOption === 'department') {
    filteredFiles = files.filter(file => file.department === userDepartement);
  } else if (shareOption === 'otherDepartment') {
    filteredFiles = files.filter(file => {
      const isSameDepartment = file.department === selectedDepartment;
      const isCurrentUserFile = file.created_by?.id === currentUser?.id;
      return isSameDepartment && isCurrentUserFile;
    });
  }

  filteredFiles = filteredFiles.filter(file =>
    file.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2 className="text-white">Documents Publics</h2>
      <form onSubmit={handleAddFile}>
        <input className="form-control mt-2" type="file" onChange={handleFileInputChange} multiple />
        <div className="mt-3">
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" value="public" checked={shareOption === 'public'} onChange={handleShareOptionChange} />
            <label className="form-check-label">Partager publiquement</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" value="department" checked={shareOption === 'department'} onChange={handleShareOptionChange} />
            <label className="form-check-label">Partager dans mon département ({userDepartement})</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" value="otherDepartment" checked={shareOption === 'otherDepartment'} onChange={handleShareOptionChange} />
            <label className="form-check-label">Partager dans un autre département</label>
          </div>
          {shareOption === 'otherDepartment' && (
            <select className="form-select mt-2" onChange={handleDepartmentChange}>
              <option value="">Sélectionner un département</option>
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
          )}
        </div>
        <button type="submit" className="ui inverted blue button mt-3">Ajouter</button>
      </form>
      <h3 className="text-white mt-5">
        {shareOption === 'public' ? 'Fichiers Publics' : shareOption === 'department' ? `Fichiers dans le Département ${userDepartement}` : `Fichiers dans le Département ${selectedDepartment}`}
      </h3>
      <div style={{display:'flex'}}>
        <div className="mt-3">
          <label className="me-2">Rechercher par nom :</label>
          <input type="text" className="form-control w-auto d-inline-block" placeholder="Rechercher un fichier" value={searchInput} onChange={handleSearchInputChange} />
        </div>
        <div className="mt-3">
          <label className="ms-2">Filtrer par date de publication :</label>
          <input type="date" className="form-control w-auto d-inline-block ms-2" onChange={handleFilterDateChange} />
        </div>
      </div>
      <ul className="list-group mt-3" style={{ maxHeight: '270px', overflowY: 'auto' }}>
        {filteredFiles.map((file, index) => (
          <li key={index} className="list-group-item mt-2">
            <span>{file.name}</span>
            <div>
              <p>Partagé par : {file.created_by ? `${file.created_by.prenom} ${file.created_by.nom}` : ''}</p>
              <p>Du département : {file.created_by?.departement}</p>
              {file.created_at && <p>Date de partage : {new Date(file.created_at).toLocaleDateString()}</p>}
              {currentUser?.id === file.created_by?.id && (
                <i className="trash icon large" title='Supprimer' type='button' onClick={() => handleDeleteFile(file.id, file.created_by?.id)}></i>
              )}
              <i className="download icon large ms-1" title='Télécharger' type='button' onClick={() => handleDownloadFile(file.file)}></i>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentPublic;
