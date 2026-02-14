import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBNhdtn1GCHQlagtSZ2pBEoze9XLHF_Zws",
    authDomain: "leadenforce-clone.firebaseapp.com",
    projectId: "leadenforce-clone",
    storageBucket: "leadenforce-clone.appspot.com",
    messagingSenderId: "958774538879",
    appId: "1:958774538879:web:auto"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
