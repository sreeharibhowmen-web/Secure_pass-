import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBipUmScFp3z2y6wZQ_OzPk4hemvB5QSZM",
  authDomain: "pass-system-3ff62.firebaseapp.com",
  projectId: "pass-system-3ff62",
  storageBucket: "pass-system-3ff62.firebasestorage.app",
  messagingSenderId: "85208385176",
  appId: "1:85208385176:web:35cfe4600550115b5572ed"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);