import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import Commentaire from './commentaire'
import Profil from './profil'
import Amis from './amis'

const Actualite = (props) => {
  const [publications, setPublications] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const userData = props.userData

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const { data } = await api.get('/feed/');
        setPublications(data);
      } catch (err) {
        console.error('Erreur lors de la récupération du fil :', err);
        setError('Une erreur est survenue lors de la récupération des publications.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  };

  const handleLike = async (publication) => {
    try {
      const { data } = await api.post(`/publications/${publication.id}/like/`);
      setPublications(prev =>
        prev.map(pub =>
          pub.id === publication.id
            ? { ...pub, likes_count: data.likes_count, liked_by_current_user: data.liked }
            : pub
        )
      );
    } catch (err) {
      console.error('Erreur lors de la mise à jour des likes :', err);
    }
  };

  return (
    <div className="container">
      {loading ? (
        <div className='loader'></div>
      ) : (
        <div className='row'>
          <div className="col-md-3 mt-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Profil userData={userData} />
          </div>
          <div className='col-md-6' style={{ maxHeight: '99vh', overflowY: 'auto', borderRadius:'30px'}}>
            {publications.map((publication) => (
              <div key={publication.id} className="card mb-3 mt-2">
                <div className='card-body'>
                  <div className='d-flex align-items-center mb-2'>
                    <img src={publication.author?.profile_image} alt="Photo de profil" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '20px'}}/>
                    <p><strong>{publication.author?.prenom} {publication.author?.nom}</strong></p>
                  </div>
                  <h3 className='card-title'>{publication.titre}</h3>
                  <p>{publication.content}</p>
                  <p>La date du : <strong>{formatDate(publication.date)}</strong></p>
                  {publication.files && publication.files.map((file, index) => (
                    <div key={index} className="mb-3">
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

                  <nav className="navbar navbar-expand-lg bg-light">
                    <div className="container-fluid">
                      <div className="ui labeled button" tabIndex="0">
                        <div className="ui button" onClick={() => handleLike(publication)}>
                          {publication.liked_by_current_user
                            ? (<><i className="red heart icon"></i>Dislike</>)
                            : (<><i className="heart icon"></i>Like</>)}
                        </div>
                        <a className="ui basic label">{publication.likes_count}</a>
                      </div>
                      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                      </button>
                      <Commentaire userData={userData} publicationId={publication.id} />
                    </div>
                  </nav>
                </div>
              </div>
            ))}
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
          <div className="col-md-3 mt-2">
            <Amis/>
          </div>
        </div>
      )}
    </div>
  )
}

export default Actualite
