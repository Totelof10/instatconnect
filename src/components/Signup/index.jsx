import React, { useState, useContext } from 'react'
import { FirebaseContext } from '../FireBase'
import { Link, useNavigate } from 'react-router-dom'

const SignUp = () => {
  const navigateTo = useNavigate();

  const fireBase = useContext(FirebaseContext)
  //console.log(fireBase)

  const data ={
    pseudo:'',
    email:'',
    password:'',
    confirmPassword:''
  }

  const [loginData, setLoginData]= useState(data)

  const [error, setError] = useState()

  const handleChange = (e)=>{
    setLoginData({...loginData, [e.target.id]:e.target.value})
  }

  const handleSubmit = (e) =>{
    e.preventDefault()
    const {email, password} = loginData
    fireBase.signupUser(email, password)
    .then(user=>{
      setLoginData({...data})
      navigateTo('/welcome')
    })
    .catch(error=>{
      setError(error.message)
      setLoginData({...data})
    })
  }

  const {pseudo, email, password, confirmPassword} = loginData

  const btnInscription = pseudo === '' || email ===''|| password===''|| password !== confirmPassword
  ? <button disabled>S'inscrire</button>:<button className='ui inverted primary button'>S'inscrire</button> 

  //Gestion erreur
  const msgError = error ? <div class="alert alert-danger" role="alert">{error}</div>:''


  return (
    <div className='container-md d-flex justify-content-center'>
      <form className="ui form" onSubmit={handleSubmit}>
        <div className="field">
          <h2 style={{marginTop:'10px'}}>INSCRIPTION</h2>
          {msgError}
          <label htmlFor='pseudo'>Pseudo</label>
          <input onChange={handleChange}  value={pseudo} type="text" name="first-name" placeholder="Pseudo" id='pseudo' autoComplete='off' required/>
        </div>
        <div className="field">
          <label htmlFor='email'>Email</label>
          <input onChange={handleChange} value={email} type="email" name="last-name" placeholder="Email" id='email' autoComplete='off' required/>
        </div>
        <div className="field">
          <label htmlFor='password'>Mot de Passe</label>
          <input onChange={handleChange} value={password} type="password" name="last-name" placeholder="Mot de passe" id='password' autoComplete='off' required/>
        </div>
        <div className="field">
          <label htmlFor='confirmPassword'>Confirmer mot de passe</label>
          <input onChange={handleChange}  value={confirmPassword} type="password" name="last-name" placeholder="Confirmer mot de passe" id='confirmPassword' autoComplete='off' required/>
        </div>
        {btnInscription}
        <div style={{marginTop:'10px'}}>
          <p>Deja inscrit? <Link to='/login' style={{textDecoration:'none'}}>Connectez-vous.</Link></p>
        </div>
        </form>
    </div>
  )
}

export default SignUp
