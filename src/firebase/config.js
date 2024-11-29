import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  // Your Firebase configuration here
  apiKey: "AIzaSyAKXr8RV5UZeWU6vKqZlqVJSJhYsAxM_Yw",
  authDomain: "chatapp-c8c72.firebaseapp.com",
  projectId: "chatapp-c8c72",
  storageBucket: "chatapp-c8c72.appspot.com",
  messagingSenderId: "1045791027778",
  appId: "1:1045791027778:web:c7f4f7a4c6d8f3f3f3f3f3",
  databaseURL: "https://chatapp-c8c72-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
