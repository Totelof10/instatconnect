import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDQbIDFXZGUHPiNtNg-gceX5ozWb9JE2i8",
    authDomain: "instatconnect.firebaseapp.com",
    projectId: "instatconnect",
    storageBucket: "instatconnect.appspot.com",
    messagingSenderId: "18236428827",
    appId: "1:18236428827:web:1922d90e90136c73401ebe"
};

class Firebase {
    constructor() {
        initializeApp(firebaseConfig);
        this.auth = getAuth();
    }

    // Inscription
    signupUser = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(this.auth, email, password);
            alert('Inscription reussi!!')
            // Si l'utilisateur est inscrit avec succès, vous pouvez faire quelque chose ici.
        } catch (error) {
            console.error("Erreur lors de l'inscription:", error);
            throw error; // Vous pouvez choisir de rejeter l'erreur ou de la gérer d'une autre manière.
        }
    }

    // Connexion
    loginUser = async (email, password) => {
        try {
            await signInWithEmailAndPassword(this.auth, email, password);
            alert('???')
            // Si l'utilisateur se connecte avec succès, vous pouvez faire quelque chose ici.
        } catch (error) {
            console.error("Erreur lors de la connexion:", error);
            throw error; // Vous pouvez choisir de rejeter l'erreur ou de la gérer d'une autre manière.
        }
    }

    // Déconnexion
    logoutUser = async () => {
        try {
            await signOut(this.auth);
            // Si l'utilisateur est déconnecté avec succès, vous pouvez faire quelque chose ici.
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            throw error; // Vous pouvez choisir de rejeter l'erreur ou de la gérer d'une autre manière.
        }
    }
}

export default Firebase;
