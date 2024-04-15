import React,{useState, useContext} from 'react'
import forgetpassword from '../../images/ForgetPassword.png'
import {FirebaseContext} from '../FireBase/firebase'
import { Link, useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'


const ForgetPassword = () => {

    const firebase = useContext(FirebaseContext)
    const navigateTo = useNavigate()
    const [showAnimation, setShowAnimation] = useState(false)

    const [email, setEmail] = useState('')
    const [error, setError] = useState('');
    
    const handleSubmit = async (e) =>{
      e.preventDefault()
      try {
        const forgetPassword = await sendPasswordResetEmail(firebase,email);
        console.log('Email de réinitialisation de mot de passe envoyé avec succès.');
        setShowAnimation(true)
        setTimeout(() => {
          navigateTo('/login');
        }, 5000);
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'email de réinitialisation de mot de passe :", error);
        setError(error.message);
        setEmail('');
      }

    }

    const btnDisabled = email === '' ? (<button disabled>Récupérer</button>) : (<button className='ui inverted blue button'>Récupérer</button>)
  return (
    <div className='forgot-container'>
      <div className='image-forgot'>
        <img src={forgetpassword} alt='Mot de passe oublie?' />
      </div>
      <div className='login-content'>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            <h2 style={{ marginTop: '10px' }}>MOT DE PASSE OUBLIE?</h2>
            {showAnimation && (
              <span className='alert alert-success'>Accédez à votre email pour reinitialiser votre mot de passe</span>
            )}
          </div>
          <div className="field">
            <label htmlFor='email'>Email</label>
            <input style={{ width: '300px' }} onChange={(e) => setEmail(e.target.value)} value={email} type="email" name="email" placeholder="Email" autoComplete='off' required />
          </div>
          {btnDisabled}
          <div style={{ marginTop: '10px' }}>
            <p>Deja inscrit?<Link to='/login' style={{ textDecoration: 'none' }}>Connectez-vous</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgetPassword
