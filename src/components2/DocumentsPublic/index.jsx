import React, { useContext, useState, useEffect } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { getFirestore, collection, query, getDocs, deleteDoc, addDoc, doc, orderBy, limit, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DocumentPublic = (props) => {
  const firebaseAuth = useContext(FirebaseContext);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [shareOption, setShareOption] = useState('public');
  const [filterDate, setFilterDate] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        let q = query(collection(db, 'files'), limit(10));

        if (filterDate) {
          const start = new Date(filterDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(filterDate);
          end.setHours(23, 59, 59, 999);
          q = query(collection(db, 'files'), where('createdAt', '>=', start), where('createdAt', '<=', end), limit(10));
        }

        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate() // Convertir le timestamp firestore en date JS
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
          const createdAt = new Date();
          const fileDocRef = await addDoc(collection(db, 'files'), {
            name: file.name,
            url: url,
            createdBy: { userId, userName, userDepartement },
            department: department,
            createdAt: createdAt
          });
          return { id: fileDocRef.id, name: file.name, url: url, createdBy: { userId, userName, userDepartement }, department: department, createdAt: createdAt };
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
        console.error('Vous n\'etes pas autorise a supprimer');
      }
    } catch (error) {
      console.error('Erreur: ', error);
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

  let filteredFiles;
  if (shareOption === 'public') {
    filteredFiles = files.filter(file => !file.department);
  } else if (shareOption === 'department') {
    filteredFiles = files.filter(file => file.department === props.userData.departement);
  } else if (shareOption === 'otherDepartment') {
    filteredFiles = files.filter(file => {
      const isSameDepartment = file.department === selectedDepartment;
      const isCurrentUserFile = file.createdBy.userId === firebaseAuth.currentUser.uid;
      return isSameDepartment && isCurrentUserFile;
    });
  }

  return (
    <div className="container mt-5">
      <h2 className="text-white">Documents Publics</h2>
      <form onSubmit={handleAddFile}>
        <input className="form-control mt-2" type="file" onChange={handleFileInputChange} multiple />
        <div className="mt-3">
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" value="public" checked={shareOption === 'public'} onChange={handleShareOptionChange} />
            <label className="form-check-label">Partager publiquement</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" value="department" checked={shareOption === 'department'} onChange={handleShareOptionChange} />
            <label className="form-check-label">Partager dans mon département ({props.userData.departement})</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" value="otherDepartment" checked={shareOption === 'otherDepartment'} onChange={handleShareOptionChange} />
            <label className="form-check-label">Partager dans un autre département</label>
          </div>
          {shareOption === 'otherDepartment' && (
            <select className="form-select mt-2" onChange={handleDepartmentChange}>
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
        <button type="submit" className="ui  inverted blue button mt-3">Ajouter</button>
      </form>
      <h3 className="text-white mt-5">{shareOption === 'public' ? 'Fichiers Publics' : shareOption === 'department' ? `Fichiers dans le Département ${props.userData.departement}` : `Fichiers dans le Département ${selectedDepartment}`}</h3>
      <div className="mt-3">
        <label className="me-2">Filtrer par date de publication :</label>
        <input type="date" className="form-control w-auto d-inline-block" onChange={handleFilterDateChange} />
      </div>
      <ul className="list-group mt-3" style={{ maxHeight: '270px', overflowY: 'auto' }}>
        {filteredFiles.map((file, index) => (
          <li key={index} className="list-group-item mt-2">
            <span>{file.name}</span>
            <div>
              <p>Partagé par : {file.createdBy.userName}</p>
              <p>Du département : {file.createdBy.userDepartement}</p>
              {file.createdAt && <p>Date de partage : {file.createdAt.toLocaleDateString()}</p>}
              {firebaseAuth.currentUser.uid === file.createdBy.userId && (
                <i className="trash icon large" title='Supprimer' type='button' onClick={() => handleDeleteFile(file.id, file.createdBy.userId)}></i>
                )}
              <i className="download icon large ms-1" title='Télécharger' type='button' onClick={() => handleDownloadFile(file.url)}></i>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentPublic;
