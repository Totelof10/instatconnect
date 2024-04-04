import React, { useState, useEffect, useContext } from 'react'
import { FirebaseContext } from '../FireBase/firebase'
import { Link, useNavigate } from 'react-router-dom'
import ImageConnexion from '../../images/ImageConnexion.png'
import { signInWithEmailAndPassword, signInWithPopup, FacebookAuthProvider } from 'firebase/auth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook } from '@fortawesome/free-brands-svg-icons'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

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
        setTimeout(()=>{
          window.location.reload()
        }, 5000)
        
      }
      
    } catch (error) {
      // An error occurred during login
      setError(error.message)
      setEmail('')
      setPassword('')
    }
  }

  const handleFacebook = (e) => {
    e.preventDefault()
    signInWithPopup(firebaseAuth, provider)
      .then((result) => {
        // The signed-in user info.
        const user = result.user
        console.log(user)
        setShowSuccessAnimation(true) // Déclencher l'animation de succès
        setTimeout(() => {
          navigateTo('/welcome')
        }, 1000) // Rediriger après une seconde
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code
        const errorMessage = error.message
        // The email of the user's account used.
        const email = error.customData.email
      })
  }
  const handleTogglePassword = ()=> {
    setShowPassword(!showPassword)
  }

  return (
    <div className='login-container'>
      <div className='image-connexion'>
        <img src={ImageConnexion} alt='Connexion' />
      </div>
      <div className='login-content'>
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
            {error !== '' && <span>{error}</span>}
            <h2 style={{ marginTop: '10px' }}>CONNEXION</h2>
          </div>
          <div className="field">
            <label htmlFor='email'>Email</label>
            <input style={{ width: '300px' }} onChange={(e) => setEmail(e.target.value)} value={email} type="email" name="email" placeholder="Email" autoComplete='off' required />
          </div>
          <div className="field">
            <label htmlFor='password'>Mot de Passe</label>
            <input onChange={(e) => setPassword(e.target.value)} value={password} type={showPassword ? 'text':'password'} name="password" placeholder="Mot de passe" autoComplete='off' required/>
            <FontAwesomeIcon className="toggle-password-icon" icon={showPassword ? faEyeSlash : faEye} onClick={handleTogglePassword}/>
            
          </div>
          {btn ? <button className='ui inverted primary button'>Connexion</button> : <button disabled>Connexion</button>}
          <div style={{ marginTop: '10px' }}>
            <p>Pas encore inscrit? <Link to='/signup' style={{ textDecoration: 'none' }}>Inscrivez-vous.</Link></p>
            <p>Mot de passe oublié?<Link to='/forgetpassword' style={{ textDecoration: 'none' }}>Récupérer ici</Link></p>
          </div>
        </form>
      </div>
      <FontAwesomeIcon icon={faFacebook} onClick={handleFacebook} style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block', color: 'blue', fontSize: '2em' }} />
    </div>
  )
}

export default Login
