import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../../services/api';

const TopPublication = () => {
  const [topPublications, setTopPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopPublications = async () => {
      try {
        const { data } = await api.get('/feed/');
        const sorted = data
          .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
          .slice(0, 3);
        setTopPublications(sorted);
      } catch (err) {
        console.error('Erreur lors de la récupération des tendances:', err);
        setError('Une erreur est survenue lors de la récupération des publications.');
      } finally {
        setLoading(false);
      }
    };
    fetchTopPublications();
  }, []);

  if (loading) return <p className='loader'></p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="carousel-container mt-3" style={{ maxHeight: '80vh'}}>
      <h2 style={{fontStyle:'italic', color:'white', fontFamily:'arial'}}>Tendances</h2>
      <Carousel className="carousel" interval={3000} controls={true} indicators={true}>
        {topPublications.map((publication, index) => (
          <Carousel.Item key={index}>
            {publication.files && publication.files.length > 0 && (
              <img
                className="d-block w-100"
                src={publication.files[0].file}
                alt={publication.titre}
                style={{
                  borderRadius:'30px',
                  maxHeight: '80vh',
                  width: '100%',
                  objectFit: 'cover',
                  imageRendering: 'auto'
                }}
              />
            )}
            <Carousel.Caption>
              <h3>{publication.titre}</h3>
              <p>{publication.author?.prenom} {publication.author?.nom} - {publication.likes_count || 0} Likes</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default TopPublication;
