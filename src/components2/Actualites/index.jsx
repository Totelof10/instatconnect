import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, Button } from 'react-bootstrap';

const Actualite = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [publicationsWithUsers, setPublicationsWithUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPublicationsWithUsers() {
      try {
        const db = getFirestore();
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        const publicationsData = [];

        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          const userPublicationsRef = collection(doc(db, 'users', userId), 'publications');
          const publicationsSnapshot = await getDocs(userPublicationsRef);

          for (const publicationDoc of publicationsSnapshot.docs) {
            const publication = publicationDoc.data();
            const userData = userDoc.data();

            // Récupérer les fichiers associés à la publication
            let fileUrls = [];
            if (publication.files && publication.files.length > 0) {
              fileUrls = await Promise.all(publication.files.map(async (fileName) => {
                const storageRef = ref(getStorage(), `images/${fileName}`);
                const url = await getDownloadURL(storageRef);
                return { name: fileName, url };
              }));
            }

            const publicationData = {
              id: publicationDoc.id,
              title: publication.title,
              content: publication.content,
              user: {
                nom: userData.nom,
                prenom: userData.prenom
              },
              files: fileUrls // Ajouter les fichiers à la publicationData
            };

            publicationsData.push(publicationData);
          }
        }

        setPublicationsWithUsers(publicationsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des publications avec les utilisateurs :", error);
        setError('Une erreur est survenue lors de la récupération des publications.');
      }
    }

    fetchPublicationsWithUsers();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Actualité :</h2>
      {publicationsWithUsers.map((publication) => (
        <Card key={publication.id} className="mb-3">
          <Card.Body>
            <Card.Title>{publication.title}</Card.Title>
            <Card.Text>{publication.content}</Card.Text>
            <Card.Text>Publié par : {publication.user.prenom} {publication.user.nom}</Card.Text>
            {publication.files && publication.files.map((file, index) => (
              <div key={index} className="mb-3">
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Actualite;
