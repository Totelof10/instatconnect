import { getFirestore, collection, addDoc, doc, query, where, getDocs, getDoc } from "firebase/firestore"
import React, { useState, useEffect } from 'react'

const Commentaire = (props) => {
    const [commentaire, setCommentaire] = useState('')
    const [commentaires, setCommentaires] = useState([])
    const [loading, setLoading] = useState(true)
    const [visible, setVisible] = useState(false)


    useEffect(() => {
        const fetchCommentaires = async () => {
            try {
                const db = getFirestore()
                const publicationId = props.publicationId
                const publicationAuthorId = props.publicationAuthorId

                // Créer une référence à la collection "commentaires" sous la publication
                const commentsRef = collection(doc(db, 'users', publicationAuthorId, 'publications', publicationId), 'commentaires')
                const querySnapshot = await getDocs(commentsRef)
                
                // Créer un tableau de commentaires à partir des documents récupérés
                const commentairesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                
                // Récupérer les informations de l'utilisateur pour chaque commentaire
                const commentairesAvecUserInfo = await Promise.all(commentairesData.map(async (commentaire) => {
                    const userInfo = await getUserInfo(commentaire.userId)
                    return { ...commentaire, userInfo }
                }))
                
                setCommentaires(commentairesAvecUserInfo)
                setLoading(false)
            } catch (error) {
                console.error('Erreur lors de la récupération des commentaires :', error)
            }
        }

        fetchCommentaires()
    }, [props.publicationId, props.publicationAuthorId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const userId = props.userData.id
        const publicationId = props.publicationId
        const publicationAuthorId = props.publicationAuthorId
        const db = getFirestore()
        
        // Créer une référence au document de publication dans la sous-collection "publications" de l'utilisateur
        const publicationRef = doc(db, 'users', publicationAuthorId, 'publications', publicationId)

        // Ajouter un nouveau commentaire avec l'userID comme ID du document dans la sous-collection "commentaires"
        await addDoc(collection(publicationRef, 'commentaires'), {
            userId: userId,
            contenu: commentaire,
            date: new Date() // Utilisez la date actuelle ou une méthode pour obtenir la date
        })

        // Effacer le champ de commentaire après l'envoi
        setCommentaire('')
        window.location.reload()
    }

    // Fonction pour récupérer les informations de l'utilisateur à partir de son ID
    const getUserInfo = async (userId) => {
        try {
            const db = getFirestore()
            const userRef = doc(db, 'users', userId)
            const userDoc = await getDoc(userRef)

            if (userDoc.exists()) {
                const userData = userDoc.data()
                return userData
            } else {
                console.log('Aucun utilisateur trouvé avec cet ID.')
                return null
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des informations de l\'utilisateur :', error)
            return null
        }
    }
    const toggleVisibility = () => {
        setVisible(!visible)
    }
    const handleChangeCommentaire = (e) =>{
        setCommentaire(e.target.value)
    }

    /*const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        return date.toLocaleDateString('fr-FR', options)
      }*/


    return (
        <div>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <form className="d-flex" role="search">
                    <input 
                        className="form-control" 
                        type="text" 
                        onChange={handleChangeCommentaire}
                        placeholder="Commentaire" 
                        aria-label="Commentaire"
                        value={commentaire}
                    />
                    <button className="btn btn-outline-success" type="submit" onClick={handleSubmit} disabled={commentaire.trim()===''}>Commenter</button>
                </form>
            </div>
            <div className="mt-2">
                <button className="ui vertical animated button" tabIndex='0' onClick={toggleVisibility}>
                    <div className="hidden content">{visible ? 'Masquer' : 'Afficher'}</div>
                    <div className="visible content">
                        <i className="comment icon"></i>
                    </div>
                </button>
                {loading ? (
                    <p>Chargement des commentaires...</p>
                ) : visible ? (
                    <ul className="list-group">
                        {commentaires.map(commentaire => (
                            <li key={commentaire.id} className="list-group-item">
                                {commentaire.userInfo && (
                                    <span>
                                        <img src={commentaire.userInfo.profileImage} alt="Photo de profil" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '20px'}}/>
                                        <strong>{commentaire.userInfo.nom} {commentaire.userInfo.prenom}</strong>:
                                    </span>
                                )}
                                <p>{commentaire.contenu}</p>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </div>                            
    )
}

export default Commentaire
