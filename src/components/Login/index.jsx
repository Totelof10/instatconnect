import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ImageConnexion from '../../images/ImageConnexion.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const navigateTo = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [btn, setBtn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setBtn(password.length > 5 && email !== '');
  }, [password, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login/', { email, password });
      login(data.user, data.access, data.refresh);
      toast.success('Connexion réussie!');
      setTimeout(() => navigateTo('/welcome/accueil'), 1500);
    } catch (error) {
      const msg = error.response?.data?.detail || 'Email ou mot de passe incorrect.';
      toast.error(msg);
      setEmail('');
      setPassword('');
    }
  };

  const handleRetour = () => {
    navigateTo('/')
  }

  return (
    <div className='container d-flex justify-content-center align-items-center' style={{ minHeight: '75vh' }}>
      <ToastContainer />
      <div className='row'>
      <div className='col-md-2 mt-5'>
        <i className="arrow alternate circle left outline icon huge" onClick={handleRetour} type='button'></i>
          {/*<img src={imageInscription} alt="Image inscription"/>*/}
        </div>
        <div className='col-md-4 mt-5'>
          <img src={ImageConnexion} alt='Connexion' />
        </div>
      </div>
      <div className='col-md-3'>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            <h2 style={{ fontStyle: 'italic', color: 'white' }}>CONNEXION</h2>
          </div>
          <div className="field">
            <label htmlFor='email' style={{ fontStyle: 'italic', color: 'white' }}>Email</label>
            <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" name="email" placeholder="Email" autoComplete='off' required />
          </div>
          <div className="field" style={{position:'relative', display:'block'}}>
            <label htmlFor='password' style={{ fontStyle: 'italic', color: 'white' }}>Mot de Passe</label>
            <input onChange={(e) => setPassword(e.target.value)} value={password} type={showPassword ? 'text' : 'password'} name="password" placeholder="Mot de passe" autoComplete='off' required />
            <span><FontAwesomeIcon className="toggle-password-icon" icon={showPassword ? faEyeSlash : faEye} onClick={() => setShowPassword(!showPassword)} />
          </span></div>
          {btn ? <button className='ui inverted primary button'>Connexion</button> : <button disabled>Connexion</button>}
          <div style={{ marginTop: '10px' }}>
            <p style={{ fontStyle: 'italic', color: 'white' }}>Pas encore inscrit? <Link to='/signup' style={{ textDecoration: 'none' }}>Inscrivez-vous.</Link></p>
            <p style={{ fontStyle: 'italic', color: 'white' }}>Mot de passe oublié? <Link to='/forgetpassword' style={{ textDecoration: 'none' }}>Récupérer ici</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
