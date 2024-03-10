import { createContext } from 'react'
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDQbIDFXZGUHPiNtNg-gceX5ozWb9JE2i8",
    authDomain: "instatconnect.firebaseapp.com",
    projectId: "instatconnect",
    storageBucket: "instatconnect.appspot.com",
    messagingSenderId: "18236428827",
    appId: "1:18236428827:web:1922d90e90136c73401ebe"
};

const app = initializeApp(firebaseConfig)
const FirebaseContext = createContext(null)
const FirebaseProvider = ({children}) => {
    const auth = getAuth()
    return(
        <FirebaseContext.Provider value={auth}>
            {children}
        </FirebaseContext.Provider>
    )
}

export {FirebaseContext}
export {FirebaseProvider}
