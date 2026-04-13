import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Amis = () => {
  const [amisData, setAmisData] = useState([]);

  useEffect(() => {
    const fetchAmis = async () => {
      try {
        const { data } = await api.get('/auth/users/friends/');
        setAmisData(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des amis :', err);
      }
    };
    fetchAmis();
  }, []);

  return (
    <div>
      <h2 style={{ fontStyle: 'italic', color: 'white' }}>Liste des contacts :</h2>
      <ul className='list-group'>
        {amisData.map(ami => (
          <li key={ami.id} style={{ fontStyle: 'italic' }} className='list-group-item'>
            {ami.nom} {ami.prenom} <i className="user outline icon"></i> {ami.etat ? (
              <span className='badge bg-success'>En ligne</span>
            ) : (
              <span className='badge bg-danger'>Absent</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Amis;
