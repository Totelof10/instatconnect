import React, { useState, useEffect, useContext } from 'react'
import { FirebaseContext } from '../FireBase/firebase'
import { Link, useNavigate } from 'react-router-dom'
import ImageConnexion from '../../images/ImageConnexion.png'
import { signInWithEmailAndPassword, signInWithPopup, FacebookAuthProvider } from 'firebase/auth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook } from '@fortawesome/free-brands-svg-icons'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { getFirestore, doc, setDoc, collection, getDoc } from 'firebase/firestore'

const Login = () => {
  const provider = new FacebookAuthProvider()
  const navigateTo = useNavigate()
  const firebaseAuth = useContext(FirebaseContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [btn, setBtn] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false) // État pour l'animation de succès
  const [showErrorAnimation, setShowErrorAnimation] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (password.length > 5 && email !== '') {
      setBtn(true)
    } else if (btn) {
      setBtn(false)
    }
  }, [password, email, btn])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
      const usersRef = doc(getFirestore(), 'users', userCredential.user.uid);
      await setDoc(usersRef, { etat: true }, { merge: true })
      // User successfully logged in
      if(userCredential.user.emailVerified){
        console.log('User logged in:', userCredential.user)
        setEmail('')
        setPassword('')
        setShowSuccessAnimation(true) // Déclencher l'animation de succès
        setTimeout(() => {
          navigateTo('/welcome/accueil')
        }, 1000) // Rediriger après une seconde
      }else{
        setEmail('')
        setPassword('')
        setShowErrorAnimation(true)
        
      }
      
    } catch (error) {
      // An error occurred during login
      setError(error.message)
      setEmail('')
      setPassword('')
      setTimeout(()=>{
        window.location.reload()
      }, 4000)
    }
  }

  const handleFacebook = (e) => {
    e.preventDefault();
    signInWithPopup(firebaseAuth, provider)
      .then(async (result) => {
        
        const user = result.user;
  
        
        const db = getFirestore();
        const userRef = doc(collection(db, 'users'), user.uid);
        const userDoc = await getDoc(userRef);
        await setDoc(userRef, { etat: true }, { merge: true })
  
        if (!userDoc.exists()) {
          
          await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            etat: true,
            nom: '',
            numeroTelephone:'',
            prenom: user.displayName,
            departement: '',
            profileImage: user.photoURL
            
          });
  
          console.log('New user data created successfully');
        }
  
        
        setShowSuccessAnimation(true);
        setTimeout(() => {
          navigateTo('/welcome');
        }, 1000);
      })
      .catch((error) => {
        
        console.error('Error signing in with Facebook:', error);
        setShowErrorAnimation(true);
        setTimeout(()=>{
          window.location.reload()
        }, 1000)
      });
  };
  
  
  const handleTogglePassword = ()=> {
    setShowPassword(!showPassword)
  }

  return (
    <div className='container container d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
      <div className='row'>
        <div className='col-md-4 mt-5'>
          <img src={ImageConnexion} alt='Connexion' />
        </div>
      </div>    
      <div className='col-md-3'>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            {showSuccessAnimation && (
              <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                Connexion réussie!
              </div>
            )}
            {showErrorAnimation &&(
              <div className='alert alert-danger' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                Veuillez confirmer votre adresse email dans vos mails
              </div>
            )}
            {error === 'Firebase: Error (auth/invalid-credential).' && <span className='alert alert-danger'>Utilisateur invalide ou mot de passe invalide</span>}
            <h2 style={{fontStyle:'italic', color:'white'}}>CONNEXION</h2>
          </div>
          <div className="field">
            <label htmlFor='email'style={{fontStyle:'italic', color:'white'}}>Email</label>
            <input style={{ width: '300px' }} onChange={(e) => setEmail(e.target.value)} value={email} type="email" name="email" placeholder="Email" autoComplete='off' required />
          </div>
          <div className="field">
            <label htmlFor='password'style={{fontStyle:'italic', color:'white'}}>Mot de Passe</label>
            <input onChange={(e) => setPassword(e.target.value)} value={password} type={showPassword ? 'text':'password'} name="password" placeholder="Mot de passe" autoComplete='off' required/>
            <FontAwesomeIcon className="toggle-password-icon" icon={showPassword ? faEyeSlash : faEye} onClick={handleTogglePassword}/>
            
          </div>
          {btn ? <button className='ui inverted primary button'>Connexion</button> : <button disabled>Connexion</button>}
          <div style={{ marginTop: '10px' }}>
            <p style={{fontStyle:'italic', color:'white'}}>Pas encore inscrit? <Link to='/signup' style={{ textDecoration: 'none' }}>Inscrivez-vous.</Link></p>
            <p style={{fontStyle:'italic', color:'white'}}>Mot de passe oublié?<Link to='/forgetpassword' style={{ textDecoration: 'none' }}>Récupérer ici</Link></p>
          </div>
        </form>
      </div>
      <FontAwesomeIcon icon={faFacebook} onClick={handleFacebook} style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block', color: 'blue', fontSize: '2em' }} />
    </div>
  )
}

export default Login
