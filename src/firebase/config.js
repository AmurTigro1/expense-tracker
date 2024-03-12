import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBxghtrtxonjEE2Rfqa9o4MeK0dAbzINXw",
  authDomain: "expense-dd7cf.firebaseapp.com",
  projectId: "expense-dd7cf",
  storageBucket: "expense-dd7cf.appspot.com",
  messagingSenderId: "70898378213",
  appId: "1:70898378213:web:9863ba8cafaeedc6777b0c"
};

initializeApp(firebaseConfig);

const db = getFirestore();

export default db;