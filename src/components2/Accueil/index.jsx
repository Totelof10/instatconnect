import React, { useContext, useState } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase'
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const Accueil = (props) => {

  console.log(props.userData.uid)
  const firbaseAuth = useContext(FirebaseContext)

  const [data, setData] = useState({ 
    content: '', 
    files: [] 
  });


  const handlePublish = async () => {
    const { content, files } = data;

    if (content.trim() !== '' || files.length > 0) {
      const publicationData = {
        content,
        files: files.map(file => file.name)
      };

      try {
        const db = getFirestore();

      } catch (error) {
        console.error("Erreur lors de l'ajout de la publication:", error);
        alert("Erreur lors de l'ajout de la publication. Veuillez réessayer.");
      }
    } else {
      alert("La publication ne peut pas être vide.");
    }
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setData({ ...data, files: [...data.files, ...newFiles] });
  };

  return (
    <div className="ui segment">
      <textarea
        className="form-control"
        rows={3}
        placeholder="Ecrivez votre publication ici..."
        value={data.content}
        onChange={(e) => setData({ ...data, content: e.target.value })}
      />
      <input
        className="form-control"
        type="file"
        multiple
        onChange={handleFileChange}
      />
      <button className="ui primary button" onClick={handlePublish}>Publier</button>
      {data.files.length > 0 && (
        <div>
          <p>Fichiers attachés :</p>
          <ul className="ui list">
            {data.files.map((file, index) => (
              <li key={index}>
                <i className="file icon large"></i>
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Accueil;
