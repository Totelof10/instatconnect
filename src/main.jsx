import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { FirebaseProvider } from './components/FireBase/firebase.jsx'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'semantic-ui-css/semantic.css'
import 'semantic-ui-css/semantic.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  
  <React.StrictMode>
    <FirebaseProvider>
    <App />
    </FirebaseProvider>
  </React.StrictMode>,
)
