import React, { useState, useEffect, useContext } from 'react';
import {FirebaseContext} from '../FireBase/firebase'
import { Link, useNavigate } from 'react-router-dom';
import ImageConnexion from '../../images/ImageConnexion.png'
import { signInWithEmailAndPassword, signInWithPopup, FacebookAuthProvider, signInWithRedirect } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';


const Login = () => {

  const provider = new FacebookAuthProvider()
  const navigateTo = useNavigate();
  const firebaseAuth = useContext(FirebaseContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [btn, setBtn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (password.length > 5 && email !== '') {
      setBtn(true);
    } else if (btn) {
      setBtn(false);
    }
  }, [password, email, btn]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      // User successfully logged in
      console.log('User logged in:', userCredential.user);
      setEmail('');
      setPassword('');
      navigateTo('/welcome');
    } catch (error) {
      // An error occurred during login
      setError(error.message);
      setEmail('');
      setPassword('');
    }
  };

  const handleFacebook = (e) => {
    e.preventDefault()
    /*signInWithRedirect(firebaseAuth, provider)
    .then((result)=>{
        // The signed-in user info.
      const user = result.user;
      console.log(user)
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
      navigateTo('/welcome');
    })
    .catch((error)=>{
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = FacebookAuthProvider.credentialFromError(error);
    })*/
    signInWithPopup(firebaseAuth, provider)
  .then((result) => {
    // The signed-in user info.
    const user = result.user;
    console.log(user)
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;
    navigateTo('/welcome');
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  })
  .catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = FacebookAuthProvider.credentialFromError(error);

    // ...
  });
  }

  return (
    <div className='login-container'>
      <div className='image-connexion'>
        <img src={ImageConnexion} alt='Connexion' />
      </div>
      <div className='login-content'>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            {error !== '' && <span>{error}</span>}
            <h2 style={{ marginTop: '10px' }}>CONNEXION</h2>
          </div>
          <div className="field">
            <label htmlFor='email'>Email</label>
            <input style={{ width: '300px' }} onChange={(e) => setEmail(e.target.value)} value={email} type="email" name="email" placeholder="Email" autoComplete='off' required />
          </div>
          <div className="field">
            <label htmlFor='password'>Mot de Passe</label>
            <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" name="password" placeholder="Mot de passe" autoComplete='off' required />
          </div>
          {btn ? <button className='ui inverted primary button'>Connexion</button> : <button disabled>Connexion</button>}
          <div style={{ marginTop: '10px' }}>
            <p>Pas encore inscrit? <Link to='/signup' style={{ textDecoration: 'none' }}>Inscrivez-vous.</Link></p>
          </div>
        </form>
      </div>
      <FontAwesomeIcon icon={faFacebook} onClick={handleFacebook} style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block', color: 'blue', fontSize: '2em' }} />
      </div>
  );
};

export default Login;
