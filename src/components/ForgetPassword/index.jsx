import React,{useState} from 'react'
import forgetpassword from '../../images/ForgetPassword.png'
import { Link } from 'react-router-dom'


const ForgetPassword = () => {

    const [email, setEmail] = useState('')
    
    const handleSubmit = () =>{

    }

  return (
    <div className='forgot-container'>
      <div className='image-forgot'>
        <img src={forgetpassword} alt='Mot de passe oublie?' />
      </div>
      <div className='login-content'>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            <h2 style={{ marginTop: '10px' }}>MOT DE PASSE OUBLIE?</h2>
          </div>
          <div className="field">
            <label htmlFor='email'>Email</label>
            <input style={{ width: '300px' }} onChange={(e) => setEmail(e.target.value)} value={email} type="email" name="email" placeholder="Email" autoComplete='off' required />
          </div>
          <div style={{ marginTop: '10px' }}>
            <p>Deja inscrit?<Link to='/login' style={{ textDecoration: 'none' }}>Connectez-vous</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgetPassword
