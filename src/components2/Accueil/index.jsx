import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { getFirestore, collection, doc, setDoc, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, Button } from 'react-bootstrap';

const Accueil = (props) => {
  const firebaseAuth = useContext(FirebaseContext);
  const [publications, setPublications] = useState([]);
  const [newPublicationContent, setNewPublicationContent] = useState('');
  const [newPublicationTitle, setNewPublicationTitle] = useState('');
  const [newPublicationType, setNewPublicationType] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPublications() {
      try {
        if (!props.userData.uid) {
          // S'il n'y a pas d'ID utilisateur, ne rien faire
          return;
        }

        const db = getFirestore();
        const userId = props.userData.uid;
        const userPublicationsRef = collection(doc(db, 'users', userId), 'publications');
        const publicationsSnapshot = await getDocs(userPublicationsRef);
        const publicationsData = publicationsSnapshot.docs.map(doc =>{
          const data = doc.data()
          console.log(data)
          return {id: doc.id, ...data}
        });
  
        // Vérifiez si publicationsData est défini avant de l'utiliser
        if (publicationsData && publicationsData.length > 0) {
          // Récupération des fichiers attachés pour chaque publication
          await Promise.all(publicationsData.map(async (publication) => {
            if (publication.files && publication.files.length > 0) {
              const fileUrls = await Promise.all(publication.files.map(async (fileName) => {
                const url = await getDownloadURL(ref(getStorage(), `images/${fileName}`));
                return { name: fileName, url };
              }));
              publication.fileUrls = fileUrls;
            }
          }));
        }
  
        setPublications(publicationsData || []); // Utilisez une valeur par défaut si publicationsData est undefined
      } catch (error) {
        console.error("Erreur lors de la récupération des publications :", error);
      }
    }
  
    fetchPublications();
  }, [props.userData.uid]); // Ajouter props.userData.uid comme dépendance

  
  const handleNewPublicationSubmit = async (e) => {
    e.preventDefault();

    if (!newPublicationContent.trim() || !newPublicationTitle.trim() || !newPublicationType.trim()) {
      setError('Veuillez remplir tous les champs pour la publication.');
      return;
    }

    try {
      const db = getFirestore();
      const userId = props.userData.uid
      const newPublicationRef = collection(doc(db, 'users', userId),'publications');
      const publicationData = { 
        content: newPublicationContent,
        titre: newPublicationTitle,
        type: newPublicationType
      };

      if (selectedFiles.length > 0) {
        const fileNames = [];
        await Promise.all(selectedFiles.map(async (file) => {
          const storageRef = ref(getStorage(), `images/${file.name}`);
          await uploadBytes(storageRef, file);
          fileNames.push(file.name);
        }));
        publicationData.files = fileNames;
      }

      await addDoc(newPublicationRef, publicationData);
      setNewPublicationContent('');
      setNewPublicationTitle('');
      setNewPublicationType('');
      setSelectedFiles([]);
      setError('');
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la publication :', error);
      setError('Une erreur est survenue lors de l\'ajout de la publication.');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handlePublicationDelete = async (publicationId) => {
    try {
      const db = getFirestore();
      const userId = props.userData.uid;
      const publicationRef = doc(db, 'users', userId, 'publications', publicationId);
      
      await deleteDoc(publicationRef);
      
      // Recharge la page après la suppression de la publication
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la suppression de la publication :', error);
      setError('Une erreur est survenue lors de la suppression de la publication.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Partager quelque chose :</h2>
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
            type="file"
            multiple
            onChange={handleFileChange}
          />
        </div>
        <div className="mb-3">
          <Button variant="primary" type="submit">
            Ajouter la publication
          </Button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
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
            <Button variant="danger" onClick={() => handlePublicationDelete(publication.id)}>Supprimer</Button>
          </Card.Body>
        </Card>
      ))}

    </div>
  );
};

export default Accueil;
