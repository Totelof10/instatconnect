import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Commentaire = (props) => {
    const [commentaire, setCommentaire] = useState('');
    const [commentaires, setCommentaires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const fetchCommentaires = async () => {
            try {
                const { data } = await api.get(`/publications/${props.publicationId}/comments/`);
                setCommentaires(data);
            } catch (err) {
                console.error('Erreur lors de la récupération des commentaires :', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCommentaires();
    }, [props.publicationId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post(`/publications/${props.publicationId}/comments/`, {
                contenu: commentaire,
            });
            setCommentaires(prev => [...prev, data]);
            setCommentaire('');
        } catch (err) {
            console.error('Erreur lors de l\'ajout du commentaire :', err);
        }
    };

    const toggleVisibility = () => {
        setVisible(!visible);
    };

    return (
        <div>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <form className="d-flex" role="search" onSubmit={handleSubmit}>
                    <input
                        className="form-control"
                        type="text"
                        onChange={(e) => setCommentaire(e.target.value)}
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
                        {commentaires.map(c => (
                            <li key={c.id} className="list-group-item">
                                {c.user && (
                                    <span>
                                        <img src={c.user.profile_image} alt="Photo de profil" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '20px'}}/>
                                        <strong>{c.user.nom} {c.user.prenom}</strong>:
                                    </span>
                                )}
                                <p>{c.contenu}</p>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </div>                            
    );
};

export default Commentaire;
