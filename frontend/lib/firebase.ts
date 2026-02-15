import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCs3JD77MROUGD1n_WZtOJ0d8rGZlo6Pr8",
    authDomain: "planning-with-ai-339c1.firebaseapp.com",
    projectId: "planning-with-ai-339c1",
    storageBucket: "planning-with-ai-339c1.firebasestorage.app",
    messagingSenderId: "164972878558",
    appId: "1:164972878558:web:2fd88ebc8eed7d12bdc04f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();