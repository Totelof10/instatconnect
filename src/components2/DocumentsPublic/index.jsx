import React, { useContext, useState, useEffect } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { getFirestore, collection, query, getDocs, deleteDoc, addDoc, doc, orderBy, limit, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DocumentPublic = (props) => {
  const firebaseAuth = useContext(FirebaseContext);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [shareOption, setShareOption] = useState('public'); // Par défaut, partager publiquement
  const [filterDate, setFilterDate] = useState(null); // Date de filtrage
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        let q = query(collection(db, 'files'), limit(10));
        
        if (filterDate) {
          // Filtrer les fichiers en fonction de la date sélectionnée
          const start = new Date(filterDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(filterDate);
          end.setHours(23, 59, 59, 999);
          q = query(collection(db, 'files'), where('createdAt', '>=', start), where('createdAt', '<=', end), limit(10));
        }
        
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFiles(files);
      } catch (error) {
        console.error('Error fetching files: ', error);
      }
    };

    fetchFiles();
  }, [db, filterDate]);

  const handleAddFile = async (e) => {
    e.preventDefault();
    try {
      if (selectedFiles.length > 0) {
        const uploadedFiles = await Promise.all(selectedFiles.map(async file => {
          const fileRef = ref(storage, `public/${file.name}`);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          const userId = firebaseAuth.currentUser.uid;
          const { nom, prenom } = props.userData;
          const userName = `${prenom} ${nom}`;
          const department = shareOption === 'department' ? props.userData.departement : null; // Utilisation de props.userData.departement
          const fileDocRef = await addDoc(collection(db, 'files'), {
            name: file.name,
            url: url,
            createdBy: { userId, userName },
            department: department,
            createdAt: new Date()
          });
          return { id: fileDocRef.id, name: file.name, url: url, createdBy: { userId, userName }, department: department, createdAt: new Date() };
        }));

        setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Error adding file: ', error);
    }
  };

  const handleDeleteFile = async (id, createdByUserId) => {
    try {
      const userId = firebaseAuth.currentUser.uid;
      if (userId === createdByUserId) {
        await deleteDoc(doc(db, 'files', id));
        setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
      } else {
        console.error('You are not authorized to delete this file.');
      }
    } catch (error) {
      console.error('Error deleting file: ', error);
    }
  };

  const handleDownloadFile = (url) => {
    window.open(url, '_blank');
  };

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };

  const handleShareOptionChange = (event) => {
    setShareOption(event.target.value);
  };

  const handleFilterDateChange = (event) => {
    setFilterDate(event.target.value);
  };

  // Filtrer les fichiers en fonction de l'option de partage sélectionnée
  const filteredFiles = shareOption === 'public' ? files.filter(file => !file.department) : files.filter(file => file.department === props.userData.departement);

  return (
    <div>
      <h2>Documents Publics</h2>
      <form onSubmit={handleAddFile}>
        <input className='form-control mt-2' type='file' onChange={handleFileInputChange} multiple />
        <div className='mt-2'>
          <label>
            <input className='ui radio checkbox' type="radio" value="public" checked={shareOption === 'public'} onChange={handleShareOptionChange} />
            Partager publiquement
          </label>
          <label className="ms-3">
            <input  className='ui radio checkbox'type="radio" value="department" checked={shareOption === 'department'} onChange={handleShareOptionChange} />
            Partager dans mon département ({props.userData.departement})
          </label>
        </div>
        <button type="submit" className='ui inverted blue button mb-2 mt-1'>Ajouter</button>
      </form>
      <h3>{shareOption === 'public' ? 'Fichiers Publics' : `Fichiers dans le Département ${props.userData.departement}`}</h3>
      <div>
        <label className="me-2">Filtrer par date de publication : </label>
        <input type="date" onChange={handleFilterDateChange} />
      </div>
      <ul className='list-group'  style={{maxHeight:'270px', overflowY:'auto'}}>
        {filteredFiles.map((file, index) => (
          <li key={index} className='list-group-item mt-2'>
            <span>{file.name}</span>
            <div>
              <p>Partagé par : {file.createdBy.userName}</p>
              {file.createdAt && <p>Date de partage : {new Date(file.createdAt.seconds * 1000).toLocaleDateString()}</p>}
              {firebaseAuth.currentUser.uid === file.createdBy.userId && (
                <i className="trash icon large" type='button' onClick={() => handleDeleteFile(file.id, file.createdBy.userId)}></i>
              )}
              <i className="download icon large ms-1" type='button' onClick={() => handleDownloadFile(file.url)}></i>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentPublic;
