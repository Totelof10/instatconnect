import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import TopPublication from '../Tendance'


const Accueil = (props) => {
  const [publications, setPublications] = useState([])
  const [newPublicationContent, setNewPublicationContent] = useState('')
  const [newPublicationTitle, setNewPublicationTitle] = useState('')
  const [newPublicationType, setNewPublicationType] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const { data } = await api.get('/publications/');
        setPublications(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des publications :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, [])

  
  const handleNewPublicationSubmit = async (e) => {
    e.preventDefault()

    if (!newPublicationContent.trim() || !newPublicationTitle.trim() || !newPublicationType.trim()) {
      setError('Veuillez remplir tous les champs pour la publication.')
      return
    }

    try {
      const formData = new FormData();
      formData.append('content', newPublicationContent);
      formData.append('titre', newPublicationTitle);
      formData.append('type', newPublicationType);
      selectedFiles.forEach(file => formData.append('uploaded_files', file));

      const { data } = await api.post('/publications/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPublications(prev => [data, ...prev]);
      setNewPublicationContent('')
      setNewPublicationTitle('')
      setNewPublicationType('')
      setSelectedFiles([])
      setError('')
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la publication :', err)
      setError('Une erreur est survenue lors de l\'ajout de la publication.')
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
  }

  const handlePublicationDelete = async (publicationId) => {
    try {
      await api.delete(`/publications/${publicationId}/`);
      setPublications(prev => prev.filter(p => p.id !== publicationId));
    } catch (err) {
      console.error('Erreur lors de la suppression de la publication :', err)
      setError('Une erreur est survenue lors de la suppression de la publication.')
    }
  }

  return (
    <div className="container">
      <div className='row'>
        <div className='col-md-4'>
        <h2 style={{fontStyle:'italic', color:'white'}}>Partager quelque chose :</h2>
          <form onSubmit={handleNewPublicationSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-sm"
                value={newPublicationTitle}
                onChange={(e) => setNewPublicationTitle(e.target.value)}
                placeholder="Titre de la publication"
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-sm"
                value={newPublicationType}
                onChange={(e) => setNewPublicationType(e.target.value)}
                placeholder="Type de publication"
              />
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                value={newPublicationContent}
                onChange={(e) => setNewPublicationContent(e.target.value)}
                placeholder="Contenu de la publication..."
              />
            </div>
            <div className="mb-3">
              <input
                className='form-control'
                type="file"
                multiple
                onChange={handleFileChange}
              />
            </div>
            <div className="mb-3">
              <button className="ui inverted blue button" type="submit">
                Ajouter la publication
              </button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </form>
        </div>
        <div className='col-md-2'></div>
        {loading ? (
          <div className='loader-pub col-md-6 mt-1'></div>
        ):(
          <div className="col-md-6 mt-1" style={{ maxHeight: '465px', overflowY: 'auto' }}>
          {publications.map((publication) => (
          <div key={publication.id} className="card mb-3">
            <div className='card-body'>
              <h3 className='card-title'>{publication.titre}</h3>
              <p>{publication.content}</p>
              <p>{publication.type}</p>
              {publication.files && publication.files.map((file, fileIndex) => (
                <div key={fileIndex} className="mb-3">
                  {file.file.endsWith('.mp4') ? (
                    <video controls className="img-fluid">
                      <source src={file.file} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  ) : (file.file.endsWith('.pdf') || file.file.endsWith('.doc') || file.file.endsWith('.docx') || file.file.endsWith('.xlsx')) ? (
                    <a href={file.file} download>
                      {file.file.split('/').pop()}
                    </a>
                  ) : (
                    <img src={file.file} className="card-img-top img-fluid" alt="fichier" />
                  )}
                </div>
              ))}

              <button className="ui negative button" onClick={() => handlePublicationDelete(publication.id)}>Supprimer</button>
            </div>
          </div>
        ))}
        </div>
        )}
        
      </div>
      <TopPublication userData={props.userData}/>
    </div>
  )
}

export default Accueil
