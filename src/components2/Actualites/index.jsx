import React, { useState, useEffect, useContext } from 'react'
import { FirebaseContext } from '../../components/FireBase/firebase'
import { getFirestore, collection, getDocs, doc, getDoc, query, where, updateDoc, increment } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Commentaire from './commentaire'

const Actualite = (props) => {
  const firebaseAuth = useContext(FirebaseContext)
  const [publicationsWithUsers, setPublicationsWithUsers] = useState([])
  const [error, setError] = useState('')
  const userData = props.userData

  useEffect(() => {
    async function fetchPublicationsWithUsers() {
      try {
        const db = getFirestore()
        const usersRef = collection(db, 'users')
        const usersSnapshot = await getDocs(usersRef)

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
                prenom: userData.prenom
              },
              files: fileUrls ,// Ajouter les fichiers à la publicationData
              likes: publication.likes || 0,
              likedByCurrentUser: false,
              userId: publication.userId
            }

            publicationsData.push(publicationData)
          }
        }

        setPublicationsWithUsers(publicationsData)
      } catch (error) {
        console.error("Erreur lors de la récupération des publications avec les utilisateurs :", error)
        setError('Une erreur est survenue lors de la récupération des publications.')
      }
    }

    fetchPublicationsWithUsers()
  }, [])

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('fr-FR', options)
  }
  
  const handleLike = async (publicationId, likedByCurrentUser) => {
    try {
      const db = getFirestore()
      const userId = props.userData.id
      const publicationRef = doc(db, 'users', userId, 'publications', publicationId)

      // Vérifier si l'utilisateur a déjà aimé la publication
      if (!likedByCurrentUser) {
        // Incrémenter le nombre de likes et mettre à jour l'état likedByCurrentUser
        await updateDoc(publicationRef, { likes: increment(1) })
      } else {
        // Décrémenter le nombre de likes et mettre à jour l'état likedByCurrentUser
        await updateDoc(publicationRef, { likes: increment(-1) })
      }

      // Mettre à jour l'état likedByCurrentUser localement pour refléter le changement
      setPublicationsWithUsers(prevPublications => prevPublications.map(publication => {
        if (publication.id === publicationId) {
          return { ...publication, likedByCurrentUser: !likedByCurrentUser, likes: likedByCurrentUser ? publication.likes - 1 : publication.likes + 1 }
        }
        return publication
      }))
    } catch (error) {
      console.error('Erreur lors de la mise à jour des likes de la publication :', error)
      setError('Une erreur est survenue lors de la mise à jour des likes de la publication.')
    }
  }

  return (
    <div className="container mt-5">
      <div className='row'>
        <div className="col-md-3">
          <p>Contenu à gauche</p>
        </div>
        <div className='col-md-6' style={{ maxHeight: '100vh', overflowY: 'auto' }}>
          {publicationsWithUsers.map((publication) => (
          <div key={publication.id} className="card mb-3">
            <div className='card-body'>
              <h3 className='card-title'>{publication.title}</h3>
              <p>{publication.content}</p>
              <p>Publié par : {publication.user.prenom} {publication.user.nom}</p>
              <p>La date du : <strong>{formatDate(publication.date)}</strong></p>
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
              <nav className="navbar navbar-expand-lg bg-light">
                <div className="container-fluid">
                <div className="ui labeled button" tabIndex="0">
                  <div className="ui button" onClick={()=> handleLike(publication.id, publication.likedByCurrentUser)}>
                    {publication.likedByCurrentUser ? 'Dislike' : 'Like'} <i className="heart icon"></i>
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
        <div className="col-md-3">
          <p>Contenu à gauche</p>
        </div>
      </div>
    </div>
  )
}

export default Actualite
