import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const Excel = () => {
  const [excelFiles, setExcelFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const fetchExcelFiles = async () => {
      try {
        const { data } = await api.get('/documents/?type=excel');
        setExcelFiles(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des fichiers Excel:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExcelFiles();
  }, []);

  const handleAddExcel = async (e) => {
    e.preventDefault();
    try {
      if (selectedFiles.length > 0) {
        setLoading(true);
        const uploadedFiles = await Promise.all(selectedFiles.map(async file => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'excel');
          const { data } = await api.post('/documents/', formData);
          return data;
        }));
        setExcelFiles(prev => [...prev, ...uploadedFiles]);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du fichier Excel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExcel = async (id) => {
    try {
      await api.delete(`/documents/${id}/`);
      setExcelFiles(prev => prev.filter(file => file.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleDownloadExcel = (url) => {
    window.open(url, '_blank');
  };

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredExcelFiles = excelFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h2>Excel</h2>
      <form onSubmit={handleAddExcel}>
        <input className='form-control mt-2' type='file' onChange={handleFileInputChange} multiple />
        <button type="submit" className='ui inverted blue button mb-2 mt-1'>Ajouter</button>
        <input
          type="text"
          placeholder="Rechercher par nom"
          value={searchQuery}
          onChange={handleSearchInputChange}
          className='form-control mb-3'
        />
      </form>
      <ul className='list-group'>
        {loading ? (<div className='loader'></div>) : (
          <>
            {filteredExcelFiles.map((file, index) => (
              <li key={index} className='list-group-item mb-2'>
                <span>{file.name}</span>
                <div>
                  <i className="trash icon large" title='Supprimer' type='button' onClick={() => handleDeleteExcel(file.id)}></i>
                  <i className="download icon large ms-1" title='Télécharger' type='button' onClick={() => handleDownloadExcel(file.file)}></i>
                </div>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default Excel;
