import React, { useState, useContext } from 'react';
import { FirebaseContext } from '../FireBase/firebase';
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import imageInscription from '../../images/inscription.png'
import { createUserWithEmailAndPassword } from 'firebase/auth';

const SignUp = () => {
  const navigateTo = useNavigate();
  const firebaseAuth = useContext(FirebaseContext);

  const data = {
    nom: '',
    prenom:'',
    departement:'',
    email: '',
    password: '',
    confirmPassword: ''
  };

  const [loginData, setLoginData] = useState(data);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nom, prenom, departement,email, password} = loginData;

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      // User successfully signed up
      console.log('User signed up:', userCredential.user);
      const db = getFirestore();
      const uid = userCredential.user.uid
      const userDocRef = doc(collection(db, 'users'), uid);


    // Add user data to Firestore
      await setDoc(userDocRef, {
        uid: uid,
        email: email,
        nom: nom,
        prenom: prenom,
        departement: departement
      });
      alert('Compte ajouté')
      setLoginData({ ...data });
      navigateTo('/');
    } catch (error) {
      // An error occurred during sign up
      setError(error.message);
      setLoginData({ ...data });
    }
  };

  const { nom, prenom, departement,email, password, confirmPassword } = loginData;

  const btnInscription =
    nom === '' || prenom === '' || departement === '' || email === '' || password === '' || password !== confirmPassword ? (
      <button disabled>S'inscrire</button>
    ) : (
      <button className='ui inverted primary button'>S'inscrire</button>
    );

  const msgError = error ? <div className="alert alert-danger" role="alert">{error}</div> : '';

  return (
    <div className='signup-container'>
      <div className="image-inscription">
          <img src={imageInscription} alt="Image inscription"/>
      </div>

      <div className='signup-content'>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            <h2 style={{marginTop:'10px'}}>INSCRIPTION</h2>
            {msgError}
            <label htmlFor='nom'>Nom</label>
            <input style={{ width: '300px' }} onChange={handleChange} value={nom} type="text" name="nom" placeholder="Nom" id='nom' autoComplete='off' required/>
          </div>
          <div className="field">
            <label htmlFor='prenom'>Prénoms</label>
            <input onChange={handleChange} value={prenom} type="text" name="prenom" placeholder="Prenom" id='prenom' autoComplete='off' required/>
          </div>
          <div className="field">
            <label htmlFor='departement'>Departement</label>
            <input onChange={handleChange} value={departement} type="text" name="departement" placeholder="Departement" id='departement' autoComplete='off' required/>
          </div>
          <div className="field">
            <label htmlFor='email'>Email</label>
            <input onChange={handleChange} value={email} type="email" name="email" placeholder="Email" id='email' autoComplete='off' required/>
          </div>
          <div className="field">
            <label htmlFor='password'>Mot de Passe</label>
            <input onChange={handleChange} value={password} type="password" name="password" placeholder="Mot de passe" id='password' autoComplete='off' required/>
          </div>
          <div className="field">
            <label htmlFor='confirmPassword'>Confirmer mot de passe</label>
            <input onChange={handleChange} value={confirmPassword} type="password" name="confirmPassword" placeholder="Confirmer mot de passe" id='confirmPassword' autoComplete='off' required/>
          </div>
          {btnInscription}
          <div style={{marginTop:'10px'}}>
            <p>Deja inscrit? <Link to='/login' style={{textDecoration:'none'}}>Connectez-vous.</Link></p>
          </div>
          </form>
      </div>
    </div>
    
  );
};

export default SignUp;
