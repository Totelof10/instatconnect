import React, { useState, useContext, useEffect } from 'react';
import { FirebaseContext } from '../FireBase/firebase';
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link, useNavigate } from 'react-router-dom';
import imageInscription from '../../images/inscription.png';

const SignUp = () => {
  const navigateTo = useNavigate();
  const firebaseAuth = useContext(FirebaseContext);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showTogglePassword1, setShowTogglePassword1] = useState(false);
  const [showTogglePassword2, setShowTogglePassword2] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const data = {
    nom: '',
    prenom:'',
    departement:'',
    numeroTelephone:'',
    email: '',
    password: '',
    confirmPassword: '',
    publication:'',
    message:'',
    ami:'',
    groupeDiscussion:'',
    file:''
  };

  const [loginData, setLoginData] = useState(data);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nom, prenom, numeroTelephone,departement, email, password } = loginData;

    // Vérifier si une image de profil a été sélectionnée
    if (!profileImage) {
      setError("Veuillez sélectionner une image de profil.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      // User successfully signed up
      await sendEmailVerification(userCredential.user);

      console.log('User signed up:', userCredential.user);
      const db = getFirestore();
      const uid = userCredential.user.uid;
      const userDocRef = doc(collection(db, 'users'), uid);

      // Upload profile image to storage
      const storage = getStorage();
      const storageRef = ref(storage, `profile_images/${uid}`);
      await uploadBytes(storageRef, profileImage);
      const imageUrl = await getDownloadURL(storageRef);

      // Add user data including image URL to Firestore
      await setDoc(userDocRef, {
        id: uid,
        numeroTelephone: numeroTelephone,
        email: email,
        nom: nom,
        prenom: prenom,
        departement: departement,
        profileImage: imageUrl
      });

      setLoginData({ ...data });
      setShowSuccessAnimation(true); // Déclencher l'animation de succès
      setTimeout(() => {
        navigateTo('/');
      }, 3000);
    } catch (error) {
      // An error occurred during sign up
      console.log(error);
      setError(error.message);
      setLoginData({ ...data });
      setTimeout(()=>{
        window.location.reload()
      }, 1000)
    }
  };

  const handleToggle1 = () => {
    setShowTogglePassword1(!showTogglePassword1);
  };

  const handleToggle2 = () =>{
    setShowTogglePassword2(!showTogglePassword2);
  };

  const { nom, prenom, departement, numeroTelephone,email, password, confirmPassword } = loginData;

  const btnInscription =
    nom === '' || prenom === '' || departement === '' ||numeroTelephone ==='' || email === '' || password === '' || password !== confirmPassword ? (
      <button disabled>S'inscrire</button>
    ) : (
      <button className='ui inverted primary button'>S'inscrire</button>
    );

  const msgError = error ? <div className="alert alert-danger" role="alert">{error}</div> : '';

  

  return (
    <div className='container'>
      <div className="row">
        <div className='col-md-6 mt-5'>
          <img src={imageInscription} alt="Image inscription"/>
        </div>
        <div className='col-md-4'>
          <form className="ui form" onSubmit={handleSubmit}>
            <div className="field">
              <h2 style={{marginTop:'10px'}}>INSCRIPTION</h2>
              {showSuccessAnimation && (
                <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  Inscription réussie! Veuillez confirmer votre identité dans votre adresse email
                </div>
              )}
              {msgError}
              <div style={{ display: 'flex' }}>
                <div style={{ marginRight: '10px', flex: '1' }}>
                  <label htmlFor='nom'>Nom</label>
                  <input onChange={handleChange} value={nom} type="text" name="nom" placeholder="Nom" id='nom' autoComplete='off' required/>
                </div>
                <div style={{ flex: '1' }}>
                  <label htmlFor='prenom'>Prénoms</label>
                  <input onChange={handleChange} value={prenom} type="text" name="prenom" placeholder="Prenom" id='prenom' autoComplete='off' required/>
                </div>
              </div>
            </div>
            <div className="field">
              <label htmlFor='departement'>Département</label>
              <select  className='form-control' onChange={handleChange} value={departement} name="departement" id='departement' required>
                <option value="">Sélectionnez un département</option>
                <option value="CGP">CGP</option>
                <option value="DAAF">DAAF</option>
                <option value="DSIC">DSIC</option>
                <option value="DFRS">DFRS</option>
                <option value="DCNM">DCNM</option>
                <option value="DSCVM">DSCVM</option>
                <option value="DSE">DSE</option>
                <option value="DDSS">DDSS</option>
                <option value="DIR INTER">DIR INTER</option>
                {/* Ajoutez d'autres options pour d'autres départements */}
              </select>
            </div>
            <div className="field">
              <label htmlFor='file'>Photo de profil</label>
              <input  className='form-control' onChange={(e) => setProfileImage(e.target.files[0])} type="file" accept="image/*" name="file" id='file' />
            </div>
            <div className="field">
              <label htmlFor='number'>Numéro de téléphone</label>
              <input onChange={handleChange} value={numeroTelephone} type="number" name="number" placeholder="Numéro de téléphone" id='numeroTelephone' autoComplete='off' required/>
            </div>
            <div className="field">
              <label htmlFor='email'>Email</label>
              <input onChange={handleChange} value={email} type="email" name="email" placeholder="Email" id='email' autoComplete='off' required/>
            </div>
            <div className="field">
              <label htmlFor='password'>Mot de Passe</label>
              <input onChange={handleChange} value={password} type={showTogglePassword1? 'text':'password'} name="password" placeholder="Mot de passe" id='password' autoComplete='off' required/>
              <FontAwesomeIcon icon={showTogglePassword1 ? faEyeSlash : faEye} className="toggle1" onClick={handleToggle1}/>
            </div>
            <div className="field">
              <label htmlFor='confirmPassword'>Confirmer mot de passe</label>
              <input onChange={handleChange} value={confirmPassword} type={showTogglePassword2? 'text':'password'} name="confirmPassword" placeholder="Confirmer mot de passe" id='confirmPassword' autoComplete='off' required/>
              <FontAwesomeIcon icon={showTogglePassword2 ? faEyeSlash : faEye} className="toggle2" onClick={handleToggle2}/>
            </div>
            {btnInscription}
            <div style={{marginTop:'10px'}}>
              <p>Deja inscrit? <Link to='/login' style={{textDecoration:'none'}}>Connectez-vous.</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
