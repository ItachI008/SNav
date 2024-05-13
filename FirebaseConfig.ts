// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "firebase api key",
  authDomain: "authdomain",
  projectId: "project ID",
  storageBucket: "bucket",
  messagingSenderId: "msg sender id",
  appId: "app id"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);

// Define the key for AsyncStorage
const AUTH_STORAGE_KEY = '@MyApp:AuthState';

// Load authentication state from AsyncStorage
AsyncStorage.getItem(AUTH_STORAGE_KEY)
  .then((authStateJSON) => {
    if (authStateJSON) {
      const authState = JSON.parse(authStateJSON);
      if (authState) {
        FIREBASE_AUTH.onAuthStateChanged((user) => {
          if (!user) {
            // Restore the user's authentication state
            signInWithEmailAndPassword(FIREBASE_AUTH, authState.email, authState.password)
              .then(() => console.log('Authentication state restored'))
              .catch((error) => console.error('Error restoring authentication state:', error));
          }
        });
      }
    }
  })
  .catch((error) => console.error('Error loading authentication state from AsyncStorage:', error));

// Save authentication state to AsyncStorage when it changes
FIREBASE_AUTH.onAuthStateChanged((user) => {
  if (user) {
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: user.email, password: '*****' }))
      .catch((error) => console.error('Error saving authentication state to AsyncStorage:', error));
  } else {
    AsyncStorage.removeItem(AUTH_STORAGE_KEY)
      .catch((error) => console.error('Error removing authentication state from AsyncStorage:', error));
  }
});






