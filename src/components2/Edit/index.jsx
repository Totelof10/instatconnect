import React ,{useState}from 'react'
import { getFirestore, doc, setDoc } from "firebase/firestore";

const Edit = (props) => {
    const userData = props.userData
    //console.log(userData)
    const [formData, setFormData] = useState({
        nom: userData ? userData.nom : '',
        prenom: userData ? userData.prenom : '',
        email: userData ? userData.email : '',
        departement: userData ? userData.departement : ''
      })
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      }

      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const db = getFirestore()
          const userDocRef = doc(db, "users", userData.id);
          await setDoc(userDocRef, formData, { merge: true });
          console.log("Données utilisateur mises à jour avec succès !");
          window.location.reload();
        } catch (error) {
          console.error("Erreur lors de la mise à jour des données utilisateur :", error);
        }
      }

  return (
    <div>
      <form className="ui form">
          <div className="field">
            <label>Nom</label>
            <input 
              type="text" 
              name="nom" 
              placeholder='Nom'
              autoComplete='off'
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Prénom(s)</label>
            <input 
              type="text" 
              name="prenom" 
              placeholder='Prénom(s)'
              autoComplete='off'
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Adresse email</label>
            <input 
              type="email" 
              name="email" 
              placeholder='Email'
              autoComplete='off'
              onChange={handleChange}  
            />
          </div>
          <div className="field">
            <label>Département</label>
            <input 
              type="text" 
              name="departement" 
              placeholder='Département'
              autoComplete='off'
              onChange={handleChange} 
               
            />
          </div>
          <button type="submit" className='ui button primary' onClick={handleSubmit}>Sauvegarder les modifications</button>
        </form>
    </div>
  )
}

export default Edit
