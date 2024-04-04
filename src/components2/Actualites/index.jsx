import React, { useState, useEffect, useContext } from 'react'
import { FirebaseContext } from '../../components/FireBase/firebase'
import { getFirestore, collection, getDocs, doc, getDoc, query, where, updateDoc, increment } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Commentaire from './commentaire'
import Profil from './profil'

const Actualite = (props) => {
  const firebaseAuth = useContext(FirebaseContext)
  const [publicationsWithUsers, setPublicationsWithUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
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
              userId: publication.userId,
              likesByUser: publication.likesByUser||{}
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
      } catch (error) {
        console.error("Erreur lors de la récupération des publications avec les utilisateurs :", error)
        setError('Une erreur est survenue lors de la récupération des publications.')
        setLoading(false)
      }

    }

    fetchPublicationsWithUsers()
  }, [props.userData.id])

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('fr-FR', options)
  }
  
  const handleLike = async (publication,likedByCurrentUser) => {
    try {
      const db = getFirestore()
      const userId = props.userData.id
      const publicationAuthorId = publication.userId
      const publicationId = publication.id
      const publicationRef = doc(db, 'users', publicationAuthorId, 'publications', publicationId)

      // Vérifier si l'utilisateur a déjà aimé la publication
      await updateDoc(publicationRef, {
        likes: likedByCurrentUser
          ? increment(-1)
          : increment(1),
        [`likesByUser.${userId}`]: !likedByCurrentUser
      })

      // Mettre à jour l'état likedByCurrentUser localement pour refléter le changement
      setPublicationsWithUsers((prevPublications) =>
        prevPublications.map((pub) => {
          if (pub.id === publicationId) {
            return {
              ...pub,
              likedByCurrentUser: !likedByCurrentUser,
              likes: likedByCurrentUser ? pub.likes - 1 : pub.likes + 1
            }
          }
          return pub
        })
      )
    } catch (error) {
      console.error('Erreur lors de la mise à jour des likes de la publication :', error)
      setError('Une erreur est survenue lors de la mise à jour des likes de la publication.')
    }
  }

  return (
    <div className="container mt-5">
      {loading ?(<div className='loader'></div>):(
        <div className='row'>
          <div className="col-md-3">
            <Profil userData={userData}/>
          </div>
          <div className='col-md-6' style={{ maxHeight: '100vh', overflowY: 'auto' }}>
            {publicationsWithUsers.map((publication) => (
            <div key={publication.id} className="card mb-3">
              <div className='card-body'>
                <h3 className='card-title'>{publication.title}</h3>
                <p>{publication.content}</p>
                <p>Publié par : <strong>{publication.user.prenom} {publication.user.nom}</strong></p>
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
                  </div>
                ))}
                <nav className="navbar navbar-expand-lg bg-light">
                  <div className="container-fluid">
                  <div className="ui labeled button" tabIndex="0">
                    <div className="ui button" onClick={()=> handleLike(publication,publication.likedByCurrentUser)}>
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
            <p>Les amis</p>
          </div>
        </div>
        )}
    </div>
  )
}

export default Actualite
