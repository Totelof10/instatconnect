import React, { useContext, useState, useEffect } from 'react';
import { FirebaseContext } from '../../../components/FireBase/firebase';
import { getFirestore, collection, query, where, getDocs, deleteDoc, addDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Word = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [wordFiles, setWordFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]); // Nouvel état pour stocker les fichiers sélectionnés
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchWordFiles = async () => {
      try {
        const userId = firebaseAuth.currentUser.uid;
        const q = query(collection(db, 'users', userId, 'word'));
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWordFiles(files);
      } catch (error) {
        console.error('Error fetching Word files: ', error);
      }
    };

    fetchWordFiles();
  }, [firebaseAuth, db]);

  const handleAddWord = async (e) => {
    e.preventDefault();
    try {
      if (selectedFiles.length > 0) {
        const uploadedFiles = await Promise.all(selectedFiles.map(async file => {
          const wordRef = ref(storage, `words/${file.name}`);
          await uploadBytes(wordRef, file);
          const url = await getDownloadURL(wordRef);
          const userId = firebaseAuth.currentUser.uid;
          const wordDocRef = await addDoc(collection(db, 'users', userId, 'word'), {
            name: file.name,
            url: url,
            createdAt: new Date()
          });
          return { id: wordDocRef.id, name: file.name, url: url };
        }));

        // Mise à jour de l'état local avec les nouveaux fichiers Word
        setWordFiles(prevFiles => [...prevFiles, ...uploadedFiles]);

        // Réinitialiser les fichiers sélectionnés après l'ajout
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Error adding Word: ', error);
    }
  };

  const handleDeleteWord = async (id) => {
    try {
      const userId = firebaseAuth.currentUser.uid;
      await deleteDoc(doc(db, 'users', userId, 'word', id));
      setWordFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    } catch (error) {
      console.error('Error deleting Word: ', error);
    }
  };

  const handleDownloadWord = (url) => {
    window.open(url, '_blank');
  };

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };

  return (
    <div>
      <h2>Word</h2>
      <form onSubmit={handleAddWord}>
        <input className='form-control mt-2' type='file' onChange={handleFileInputChange} multiple />
        <button type="submit" className='ui inverted blue button mb-2 mt-1'>Ajouter</button>
      </form>
      <ul className='list-group'>
        {wordFiles.map((file, index) => (
          <li key={index} className='list-group-item'>
            <span>{file.name}</span>
            <div>
              <i className="trash icon large" type='button' onClick={() => handleDeleteWord(file.id)}></i>
              <i className="download icon large ms-1" type='button' onClick={() => handleDownloadWord(file.url)}></i>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Word;
