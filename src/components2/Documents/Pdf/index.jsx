import React, { useContext, useState, useEffect } from 'react';
import { FirebaseContext } from '../../../components/FireBase/firebase';
import { getFirestore, collection, query, where, getDocs, deleteDoc, addDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Pdf = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchPdfFiles = async () => {
      try {
        const userId = firebaseAuth.currentUser.uid;
        const q = query(collection(db, 'users', userId, 'pdf'));
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPdfFiles(files);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching PDF files: ', error);
        setLoading(false);
      }
    };

    fetchPdfFiles();
  }, [firebaseAuth, db]);

  const handleAddPdf = async (e) => {
    e.preventDefault();
    try {
      if (selectedFiles.length > 0) {
        setLoading(true);
        const uploadedFiles = await Promise.all(selectedFiles.map(async file => {
          const pdfRef = ref(storage, `pdfs/${file.name}`);
          await uploadBytes(pdfRef, file);
          const url = await getDownloadURL(pdfRef);
          const userId = firebaseAuth.currentUser.uid;
          const pdfDocRef = await addDoc(collection(db, 'users', userId, 'pdf'), {
            name: file.name,
            url: url,
            createdAt: new Date()
          });
          return { id: pdfDocRef.id, name: file.name, url: url };
        }));

        setPdfFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Error adding PDF: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePdf = async (id) => {
    try {
      const userId = firebaseAuth.currentUser.uid;
      await deleteDoc(doc(db, 'users', userId, 'pdf', id));
      setPdfFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    } catch (error) {
      console.error('Error deleting PDF: ', error);
    }
  };

  const handleDownloadPdf = (url) => {
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

  const filteredPdfFiles = pdfFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h2>PDF</h2>
      <form onSubmit={handleAddPdf}>
        <input className='form-control mt-2' type='file' onChange={handleFileInputChange} multiple />
        <button type="submit" className='ui inverted blue button mb-2 mt-1'>Ajouter</button>
      </form>
      <input
        type="text"
        placeholder="Rechercher par nom"
        value={searchQuery}
        onChange={handleSearchInputChange}
        className='form-control mb-3'
      />
      <ul className='list-group'>
        {loading ? (<div className='loader'></div>) : (
          <>
            {filteredPdfFiles.map((file, index) => (
              <li key={index} className='list-group-item mb-2'>
                <span>{file.name}</span>
                <div>
                  <i className="trash icon large" title='Supprimer' type='button' onClick={() => handleDeletePdf(file.id)}></i>
                  <i className="download icon large ms-1" title='Télécharger' type='button' onClick={() => handleDownloadPdf(file.url)}></i>
                </div>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default Pdf;
