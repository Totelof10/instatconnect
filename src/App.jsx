import React from 'react'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Header from './components/Header'
import Landing from './components/Landing'
import Footer from './components/Footer'
import Login from './components/Login'
import SignUp from './components/Signup'
import Welcome from './components/Welcome'
import ErrorPage from './components/ErrorPage'
import ForgetPasswords from './components/ForgetPassword'
import './App.css'
function App() {

  return (
      <Router>
        <Header/>

          <Routes>
            <Route path='/' Component={Landing}/>
            <Route path='/forgetpassword' Component={ForgetPasswords}/>
            <Route path='/welcome' Component={Welcome}/>
            <Route path='/signup' Component={SignUp}/>
            <Route path='/login' Component={Login}/>
            <Route path='*' Component={ErrorPage}/>
          </Routes>
            
        <Footer/>
      </Router>
  )
}

export default App
