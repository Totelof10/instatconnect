import React, { useEffect, useState } from 'react';
import { getFirestore, collection, doc, query, onSnapshot, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


const TopPublication = ({ userData }) => {
  const [publicationsWithUsers, setPublicationsWithUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const db = getFirestore();

    const fetchPublicationsWithUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const unsubscribeUsers = onSnapshot(usersQuery, async (usersSnapshot) => {
          const publicationsData = [];

          for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userPublicationsRef = collection(doc(db, 'users', userId), 'publications');
            const publicationsSnapshot = await getDocs(userPublicationsRef);

            for (const publicationDoc of publicationsSnapshot.docs) {
              const publication = publicationDoc.data();
              const userData = userDoc.data();

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
                title: publication.titre,
                content: publication.content,
                date: publication.date.toDate(),
                user: {
                  nom: userData.nom,
                  prenom: userData.prenom,
                  profileImage: userData.profileImage
                },
                files: fileUrls,
                likes: publication.likes || 0,
                likedByCurrentUser: false,
                userId: publication.userId,
                likesByUser: publication.likesByUser || {}
              };

              const currentUserId = userData.id;
              if (publicationData.likesByUser[currentUserId]) {
                publicationData.likedByCurrentUser = true;
              }

              publicationsData.push(publicationData);
            }
          }

          const topPublications = publicationsData.sort((a, b) => b.likes - a.likes).slice(0, 3);

          setPublicationsWithUsers(topPublications);
          setLoading(false);
        });

        return () => unsubscribeUsers();
      } catch (error) {
        console.error("Erreur lors de la récupération des publications avec les utilisateurs :", error);
        setError('Une erreur est survenue lors de la récupération des publications.');
        setLoading(false);
      }
    };

    fetchPublicationsWithUsers();
  }, [userData.id]);

  if (loading) return <p className='loader'></p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="carousel-container mt-3" style={{ maxHeight: '80vh'}}>
      <h2 style={{fontStyle:'italic', color:'white', fontFamily:'arial'}}>Tendances</h2>
      <Carousel className="carousel" interval={3000} controls={true} indicators={true}>
        {publicationsWithUsers.map((publication, index) => (
          <Carousel.Item key={index}>
            {publication.files.length > 0 && (
              <img
                className="d-block w-100"
                src={publication.files[0].url}
                alt={publication.title}
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
              <h3>{publication.title}</h3>
              <p>{publication.user.nom} {publication.user.prenom} - {publication.likes} Likes</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default TopPublication;
