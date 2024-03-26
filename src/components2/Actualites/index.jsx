import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, getDownloadURL } from 'firebase/storage';
import { Card } from 'react-bootstrap';

const Actualites = () => {
  const [publications, setPublications] = useState([]);
  
  useEffect(() => {
    async function fetchAllPublications() {
      try {
        const db = getFirestore();
        const allPublicationsRef = collection(db, 'users');
        const allPublicationsSnapshot = await getDocs(allPublicationsRef);
        const allPublicationsData = [];

        allPublicationsSnapshot.forEach(userDoc => {
          const userPublications = userDoc.data().publications || [];
          userPublications.forEach(publication => {
            allPublicationsData.push({ id: publication.id, ...publication });
          });
        });

        // Récupération des fichiers attachés pour chaque publication
        await Promise.all(allPublicationsData.map(async (publication) => {
          if (publication.files && publication.files.length > 0) {
            const fileUrls = await Promise.all(publication.files.map(async (fileName) => {
              const url = await getDownloadURL(ref(getStorage(), `images/${fileName}`));
              return { name: fileName, url };
            }));
            publication.fileUrls = fileUrls;
          }
        }));

        setPublications(allPublicationsData||[]);
      } catch (error) {
        console.error("Erreur lors de la récupération des publications :", error);
      }
    }

    fetchAllPublications();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Actualités</h2>
      {publications.map((publication) => (
        <Card key={publication.id} className="mb-3">
          <Card.Body>
            <Card.Title>{publication.titre}</Card.Title>
            <Card.Text>{publication.content}</Card.Text>
            <Card.Text>{publication.type}</Card.Text>
            {publication.fileUrls && publication.fileUrls.map((file, fileIndex) => (
              <div key={fileIndex} className="mb-3">
                {file.name.endsWith('.mp4') ? (
                  <video controls className="img-fluid">
                    <source src={file.url} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                ) : (
                  <img src={file.url} className="card-img-top img-fluid" alt={file.name} />
                )}
                <p>{file.name}</p>
              </div>
            ))}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default Actualites;
