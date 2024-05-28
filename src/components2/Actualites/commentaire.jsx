import { getFirestore, collection, addDoc, doc, onSnapshot, getDoc } from "firebase/firestore";
import React, { useState, useEffect } from 'react';

const Commentaire = (props) => {
    const [commentaire, setCommentaire] = useState('');
    const [commentaires, setCommentaires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const db = getFirestore();

    useEffect(() => {
        const fetchCommentaires = () => {
            const publicationId = props.publicationId;
            const publicationAuthorId = props.publicationAuthorId;

            const commentsRef = collection(doc(db, 'users', publicationAuthorId, 'publications', publicationId), 'commentaires');

            const unsubscribe = onSnapshot(commentsRef, async (snapshot) => {
                const commentairesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const commentairesAvecUserInfo = await Promise.all(commentairesData.map(async (commentaire) => {
                    const userInfo = await getUserInfo(commentaire.userId);
                    return { ...commentaire, userInfo };
                }));

                setCommentaires(commentairesAvecUserInfo);
                setLoading(false);
            });

            return () => unsubscribe();
        };

        fetchCommentaires();
    }, [props.publicationId, props.publicationAuthorId, db]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = props.userData.id;
        const publicationId = props.publicationId;
        const publicationAuthorId = props.publicationAuthorId;

        const publicationRef = doc(db, 'users', publicationAuthorId, 'publications', publicationId);

        await addDoc(collection(publicationRef, 'commentaires'), {
            userId: userId,
            contenu: commentaire,
            date: new Date()
        });

        setCommentaire('');
    };

    const getUserInfo = async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                return userDoc.data();
            } else {
                console.log('Aucun utilisateur trouvé avec cet ID.');
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des informations de l\'utilisateur :', error);
            return null;
        }
    };

    const toggleVisibility = () => {
        setVisible(!visible);
    };

    const handleChangeCommentaire = (e) => {
        setCommentaire(e.target.value);
    };

    return (
        <div>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <form className="d-flex" role="search" onSubmit={handleSubmit}>
                    <input
                        className="form-control"
                        type="text"
                        onChange={handleChangeCommentaire}
                        placeholder="Commentaire"
                        aria-label="Commentaire"
                        value={commentaire}
                    />
                    <button className="btn btn-outline-success" type="submit" disabled={commentaire.trim() === ''}>Commenter</button>
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
    );
};

export default Commentaire;
