import React, { useContext, useState, useEffect } from 'react';
import { FirebaseContext } from '../../../components/FireBase/firebase';
import { getFirestore, collection, query, where, getDocs, deleteDoc, addDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Excel = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [excelFiles, setExcelFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchExcelFiles = async () => {
      try {
        const userId = firebaseAuth.currentUser.uid;
        const q = query(collection(db, 'users', userId, 'excel'));
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExcelFiles(files);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Excel files: ', error);
        setLoading(false);
      }
    };

    fetchExcelFiles();
  }, [firebaseAuth, db]);

  const handleAddExcel = async (e) => {
    e.preventDefault();
    try {
      if (selectedFiles.length > 0) {
        setLoading(true);
        const uploadedFiles = await Promise.all(selectedFiles.map(async file => {
          const excelRef = ref(storage, `excels/${file.name}`);
          await uploadBytes(excelRef, file);
          const url = await getDownloadURL(excelRef);
          const userId = firebaseAuth.currentUser.uid;
          const excelDocRef = await addDoc(collection(db, 'users', userId, 'excel'), {
            name: file.name,
            url: url,
            createdAt: new Date()
          });
          return { id: excelDocRef.id, name: file.name, url: url };
        }));

        setExcelFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Error adding Excel: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExcel = async (id) => {
    try {
      const userId = firebaseAuth.currentUser.uid;
      await deleteDoc(doc(db, 'users', userId, 'excel', id));
      setExcelFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    } catch (error) {
      console.error('Error deleting Excel: ', error);
    }
  };

  const handleDownloadExcel = (url) => {
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

  const filteredExcelFiles = excelFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h2>Excel</h2>
      <form onSubmit={handleAddExcel}>
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
            {filteredExcelFiles.map((file, index) => (
              <li key={index} className='list-group-item mb-2'>
                <span>{file.name}</span>
                <div>
                  <i className="trash icon large" title='Supprimer' type='button' onClick={() => handleDeleteExcel(file.id)}></i>
                  <i className="download icon large ms-1" title='Télécharger' type='button' onClick={() => handleDownloadExcel(file.url)}></i>
                </div>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default Excel;
