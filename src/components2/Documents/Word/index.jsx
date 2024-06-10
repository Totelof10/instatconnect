import React, { useContext, useState, useEffect } from 'react';
import { FirebaseContext } from '../../../components/FireBase/firebase';
import { getFirestore, collection, query, where, getDocs, deleteDoc, addDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Word = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [wordFiles, setWordFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Word files: ', error);
        setLoading(false);
      }
    };

    fetchWordFiles();
  }, [firebaseAuth, db]);

  const handleAddWord = async (e) => {
    e.preventDefault();
    try {
      if (selectedFiles.length > 0) {
        setLoading(true);
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

        setWordFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Error adding Word: ', error);
    } finally {
      setLoading(false);
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

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredWordFiles = wordFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h2>Word</h2>
      <form onSubmit={handleAddWord}>
        <input className='form-control mt-2' type='file' onChange={handleFileInputChange} multiple />
        <button type="submit" className='ui inverted blue button mb-2 mt-1'>Ajouter</button>
        <input
          type="text"
          placeholder="Rechercher par nom"
          value={searchQuery}
          onChange={handleSearchInputChange}
          className='form-control mb-3'
        />
      </form>
      <ul className='list-group'>
        {loading ? (<div className='loader'></div>) : (
          <>
            {filteredWordFiles.map((file, index) => (
              <li key={index} className='list-group-item mb-2'>
                <span>{file.name}</span>
                <div>
                  <i className="trash icon large" title='Supprimer' type='button' onClick={() => handleDeleteWord(file.id)}></i>
                  <i className="download icon large ms-1" title='Télécharger' type='button' onClick={() => handleDownloadWord(file.url)}></i>
                </div>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default Word;
