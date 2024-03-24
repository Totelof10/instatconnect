import React, { useContext, useState } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase'
import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";


const Accueil = (props) => {

  const firbaseAuth = useContext(FirebaseContext)

  const [data, setData] = useState({ 
    content: '', 
    files: [] 
  });

  const handleChange = (e) => {
    //console.log(e.target.value)
    setData({ ...data, content: e.target.value })
  }

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setData(prevData => ({
        ...prevData,
        files: [...prevData.files, ...newFiles]
    }));
};

const handlePublish = async (e) => {
  e.preventDefault();
  const { content, files } = data;

  if (content.trim() !== '' || files.length > 0) {
      const publicationData = {
          content,
          files: files.map(file => file.name)
      };

      try {
          const storage = getStorage();
          const storageRef = ref(storage, 'images/storage');
          await Promise.all(files.map(file => {
              const fileRef = ref(storageRef, file.name);
              return uploadBytes(fileRef, file);
          }));

          const db = getFirestore();
          const postDocRef = doc(collection(db, 'posts'));
          await setDoc(postDocRef, {
              content: content,
              files: publicationData.files // Ajoutez les noms des fichiers dans Firestore
          });

          alert('Publication ajoutée');
          setData({ content: '', files: [] }); // Réinitialise les données après la publication

      } catch (error) {
          console.error("Erreur lors de l'ajout de la publication:", error);
          alert("Erreur lors de l'ajout de la publication. Veuillez réessayer.");
      }
  } else {
      alert("La publication ne peut pas être vide.");
  }
};


  return (
    <div className="ui segment">
      <textarea
        className="form-control"
        rows={3}
        placeholder="Ecrivez votre publication ici..."
        value={data.content}
        onChange={handleChange}
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
