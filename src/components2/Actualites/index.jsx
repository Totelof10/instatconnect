import React, { useState, useEffect, useContext } from 'react'
import { FirebaseContext } from '../../components/FireBase/firebase'
import { getFirestore, collection, doc, onSnapshot, query, where, updateDoc, increment, getDocs } from "firebase/firestore"
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import Commentaire from './commentaire'
import Profil from './profil'
import Amis from './amis'

const Actualite = (props) => {
  const firebaseAuth = useContext(FirebaseContext)
  const [publicationsWithUsers, setPublicationsWithUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const userData = props.userData

  useEffect(() => {
    const db = getFirestore()

    // Fonction pour récupérer les publications avec les utilisateurs
    const fetchPublicationsWithUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'))
        const unsubscribeUsers = onSnapshot(usersQuery, async (usersSnapshot) => {
          const publicationsData = []

          for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id
            const userPublicationsRef = collection(doc(db, 'users', userId), 'publications')
            const publicationsSnapshot = await getDocs(userPublicationsRef)

            for (const publicationDoc of publicationsSnapshot.docs) {
              const publication = publicationDoc.data()
              const userData = userDoc.data()

              let fileUrls = []
              if (publication.files && publication.files.length > 0) {
                fileUrls = await Promise.all(publication.files.map(async (fileName) => {
                  const storageRef = ref(getStorage(), `images/${fileName}`)
                  const url = await getDownloadURL(storageRef)
                  return { name: fileName, url }
                }))
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
              }

              const userId = props.userData.id
              if (publicationData.likesByUser[userId]) {
                publicationData.likedByCurrentUser = true
              }

              publicationsData.push(publicationData)
            }
          }

          setPublicationsWithUsers(publicationsData)
          setLoading(false)
        })

        return () => unsubscribeUsers()
      } catch (error) {
        console.error("Erreur lors de la récupération des publications avec les utilisateurs :", error)
        setError('Une erreur est survenue lors de la récupération des publications.')
        setLoading(false)
      }
    }

    fetchPublicationsWithUsers()
  }, [props.userData.id])

  useEffect(() => {
    const db = getFirestore();
  
    // Fonction pour écouter les modifications du nombre de likes
    const listenToLikesChanges = () => {
      const unsubscribeLikes = onSnapshot(collection(db, 'users'), (snapshot) => {
        snapshot.forEach((userDoc) => {
          const userId = userDoc.id;
          const publicationsRef = collection(userDoc.ref, 'publications');
          const unsubscribePublications = onSnapshot(publicationsRef, (publicationsSnapshot) => {
            publicationsSnapshot.forEach((publicationDoc) => {
              const publicationId = publicationDoc.id;
              const publicationData = publicationDoc.data();
              // Mettre à jour localement le nombre de likes pour la publication modifiée
              setPublicationsWithUsers((prevPublications) =>
                prevPublications.map((pub) => {
                  if (pub.id === publicationId && pub.user.id !== userId) {
                    return { ...pub, likes: publicationData.likes };
                  }
                  return pub;
                })
              );
            });
          });
          return () => unsubscribePublications();
        });
      });
      return () => unsubscribeLikes();
    };
  
    listenToLikesChanges();
  }, []);
  
  
  
  
  

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('fr-FR', options)
  }

  const handleLike = async (publication, likedByCurrentUser) => {
    try {
        const db = getFirestore()
        const userId = props.userData.id
        const publicationAuthorId = publication.userId
        const publicationId = publication.id
        const publicationRef = doc(db, 'users', publicationAuthorId, 'publications', publicationId)

        // Mettre à jour localement le nombre de likes et l'état likedByCurrentUser
        setPublicationsWithUsers((prevPublications) =>
            prevPublications.map((pub) => {
                if (pub.id === publicationId) {
                    return {
                        ...pub,
                        likedByCurrentUser: !likedByCurrentUser,
                        likes: !likedByCurrentUser ? pub.likes + 1 : pub.likes - 1
                    }
                }
                return pub
            })
        )

        // Mettre à jour les likes dans la base de données
        await updateDoc(publicationRef, {
            likes: !likedByCurrentUser ? increment(1) : increment(-1),
            [`likesByUser.${userId}`]: !likedByCurrentUser
        })
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour des likes de la publication :', error)
        setError('Une erreur est survenue lors de la mise à jour des likes de la publication.')
    }
}



  return (
    <div className="container">
      {loading ? (
        <div className='loader'></div>
      ) : (
        <div className='row'>
          <div className="col-md-3 mt-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Profil userData={userData} />
          </div>
          <div className='col-md-6' style={{ maxHeight: '99vh', overflowY: 'auto',  borderRadius:'30px'}}>
            {publicationsWithUsers.map((publication) => (
              <div key={publication.id} className="card mb-3 mt-2">
                <div className='card-body'>
                  <div className='d-flex align-items-center mb-2'>
                    <img src={publication.user.profileImage} alt="Photo de profil" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '20px'}}/>
                    <p><strong>{publication.user.prenom} {publication.user.nom}</strong></p>
                  </div>
                  <h3 className='card-title'>{publication.title}</h3>
                  <p>{publication.content}</p>
                  <p>La date du : <strong>{formatDate(publication.date)}</strong></p>
                  {publication.files && publication.files.map((file, index) => (
                    <div key={index} className="mb-3">
                      {file.name.endsWith('.mp4') ? (
                        <video controls className="img-fluid">
                          <source src={file.url} type="video/mp4" />
                          Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
                      ) : (file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.xlsx')) ? (
                        <a href={file.url} download={file.name}>
                          {file.name}
                        </a>
                      ) : (
                        <img src={file.url} className="card-img-top img-fluid" alt={file.name} />
                      )}
                    </div>
                  ))}

                  <nav className="navbar navbar-expand-lg bg-light">
                    <div className="container-fluid">
                      <div className="ui labeled button" tabIndex="0">
                        <div className="ui button" onClick={() => handleLike(publication, publication.likedByCurrentUser)}>
                          {publication.likedByCurrentUser ? (<><i className=" red heart icon"></i>Dislike</>) : (<><i className="heart icon"></i>Like</>)} 
                        </div>
                        <a className="ui basic label">
                          {publication.likes}
                        </a>
                      </div>
                      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                      </button>
                      <Commentaire userData={userData} publicationId={publication.id} publicationAuthorId={publication.userId} />
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
