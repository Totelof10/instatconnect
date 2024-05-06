import { createContext } from 'react'
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDQbIDFXZGUHPiNtNg-gceX5ozWb9JE2i8",
    authDomain: "instatconnect.firebaseapp.com",
    projectId: "instatconnect",
    storageBucket: "instatconnect.appspot.com",
    messagingSenderId: "18236428827",
    appId: "1:18236428827:web:1922d90e90136c73401ebe",
};

const app = initializeApp(firebaseConfig)

/*if (process.env.NODE_ENV === 'development') {
    console.log('dev')
    const db = getFirestore()
    const auth = getAuth()
    const storage = getStorage()
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    if(location.hostname === 'localhost'){
        connectStorageEmulator(storage, "127.0.0.1", 9199)
    }
  }*/

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
