import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase web configuration provided by Firebase Console.
// This identifies our MiniGames Firebase project.
const firebaseConfig = {
  apiKey: 'AIzaSyCMYcWs5kPqUnnTHM2Fu2cVYiZ6g5UQE08',
  authDomain: 'minigames-rsschool.firebaseapp.com',
  projectId: 'minigames-rsschool',
  storageBucket: 'minigames-rsschool.firebasestorage.app',
  messagingSenderId: '1073040427104',
  appId: '1:1073040427104:web:53df0468efe6aefd535b05',
};

// Initialize Firebase once for the entire application.
const app = initializeApp(firebaseConfig);

// Export the Authentication instance for future auth operations.
export const auth = getAuth(app);
