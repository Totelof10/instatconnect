/**
 * Firebase has been replaced by the Django backend.
 * This file re-exports from AuthContext for backward compatibility.
 */
export { AuthContext as FirebaseContext, AuthProvider as FirebaseProvider } from '../../context/AuthContext';
