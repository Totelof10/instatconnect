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
  const [selectedDepartment, setSelectedDepartment] = useState(null); // Département sélectionné pour le partage
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
          const { nom, prenom, departement } = props.userData;
          const userName = `${prenom} ${nom}`;
          const userDepartement = `${departement}`;
          let department;
          if (shareOption === 'department') {
            department = props.userData.departement;
          } else if (shareOption === 'otherDepartment') {
            department = selectedDepartment;
          } else {
            department = null;
          }
          const fileDocRef = await addDoc(collection(db, 'files'), {
            name: file.name,
            url: url,
            createdBy: { userId, userName, userDepartement },
            department: department,
            createdAt: new Date()
          });
          return { id: fileDocRef.id, name: file.name, url: url, createdBy: { userId, userName, userDepartement }, department: department, createdAt: new Date() };
        }));
  
        setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Error adding file: ', error);
    }
  };

  const voidFile = () => {
    setSelectedFiles([])
  }
  

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

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  // Filtrer les fichiers en fonction de l'option de partage sélectionnée
  let filteredFiles;
  if (shareOption === 'public') {
    filteredFiles = files.filter(file => !file.department);
  } else if (shareOption === 'department') {
    filteredFiles = files.filter(file => file.department === props.userData.departement);
  } else if (shareOption === 'otherDepartment') {
    filteredFiles = files.filter(file => {
      // Vérifier si le fichier appartient au département sélectionné
      const isSameDepartment = file.department === selectedDepartment;
      // Vérifier si l'utilisateur actuel est le créateur du fichier
      const isCurrentUserFile = file.createdBy.userId === firebaseAuth.currentUser.uid;
      // Retourner vrai si le fichier appartient au département sélectionné et a été créé par l'utilisateur actuel
      return isSameDepartment && isCurrentUserFile;
    });
  }
  
  return (
    <div>
      <h2 style={{fontStyle:'italic', color:'white'}}>Documents Publics</h2>
      <form onSubmit={handleAddFile}>
        <input className='form-control mt-2' type='file' onChange={handleFileInputChange} multiple />
        <div className='mt-2'>
          <label>
            <input className='ui radio checkbox' type="radio" value="public" checked={shareOption === 'public'} onChange={handleShareOptionChange} />
            Partager publiquement
          </label>
          <label className="ms-3">
            <input className='ui radio checkbox' type="radio" value="department" checked={shareOption === 'department'} onChange={handleShareOptionChange} />
            Partager dans mon département ({props.userData.departement})
          </label>
          <label className="ms-3">
            <input className='ui radio checkbox' type="radio" value="otherDepartment" checked={shareOption === 'otherDepartment'} onChange={handleShareOptionChange} />
            Partager dans un autre département
          </label>
          {shareOption === 'otherDepartment' && (
            <select className='ui dropdown mt-2' onChange={handleDepartmentChange}>
              <option value="">Sélectionner un département</option>
              <option value="CGP">CGP</option>
              <option value="DAAF">DAAF</option>
              <option value="DSIC">DSIC</option>
              <option value="DFRS">DFRS</option>
              <option value="DCNM">DCNM</option>
              <option value="DSCVM">DSCVM</option>
              <option value="DSE">DSE</option>
              <option value="DDSS">DDSS</option>
              <option value="DIR INTER">DIR INTER</option>
            </select>
          )}
        </div>
        <button type="submit" className='ui inverted blue button mb-2 mt-1'>Ajouter</button>
        <button onClick={voidFile} className='ui inverted green button mb-2 mt-1'>Annuler</button>
      </form>
      <h3>{shareOption === 'public' ? 'Fichiers Publics' : shareOption === 'department' ? `Fichiers dans le Département ${props.userData.departement}` : `Fichiers dans le Département ${selectedDepartment}`}</h3>
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
              <p>Du departement : {file.createdBy.userDepartement}</p>
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
