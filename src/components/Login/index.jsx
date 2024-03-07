import React , { useState, useEffect, useContext }from 'react'
import { FirebaseContext } from '../FireBase'
import { Link, useNavigate } from 'react-router-dom'
import ImageConnexion from '../../images/ImageConnexion.png'

const Login = () => {

  const navigateTo = useNavigate()
  const FireBase = useContext(FirebaseContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [btn,setBtn] = useState(false)
  const [error, setError] = useState('')

  useEffect(()=>{
    if(password.length > 5 && email != ''){
      setBtn(true)
    }else if(btn){
      setBtn(false)

    }
  },[password,email,btn])

  const handleSubmit = (e) =>{
    e.preventDefault()

    FireBase.loginUser(email,password)
    .then(user=>{
      setEmail('')
      setPassword('')
      navigateTo('/welcome')

    })
    .catch(error=>{
      setError(error.message)
      setEmail('')
      setPassword('')
    })
  }

  return (
    <div className='login-container'>
      <div className='image-connexion'>
        <img src={ImageConnexion}/>
      </div>
      <div className='login-content'>
          <form className="ui form" onSubmit={handleSubmit}>
              <div className="field">
                {error !== '' && <span>{error}</span>}
                <h2 style={{marginTop:'10px'}}>CONNEXION</h2>
              </div>
              <div className="field">
                <label htmlFor='email'>Email</label>
                <input style={{ width: '300px', /* ou toute autre largeur souhaitée */ }} onChange={(e)=>setEmail(e.target.value)} value={email} type="email" name="last-name" placeholder="Email" autoComplete='off' required/>
              </div>
              <div className="field">
                <label htmlFor='password'>Mot de Passe</label>
                <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" name="last-name" placeholder="Mot de passe" autoComplete='off' required/>
              </div>
              {btn ? <button className='ui inverted primary button'>Connexion</button>:<button disabled>S'inscrire</button>}
              <div style={{marginTop:'10px'}}>
                <p>Pas encore inscrit? <Link to='/signup' style={{textDecoration:'none'}}>Inscrivez-vous.</Link></p>
              </div>
          </form>
      </div>
      
    </div>
  )
}

export default Login
