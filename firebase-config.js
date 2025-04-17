import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove, update } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCXVaKdHMT__FXNFQsJ3ER4Ss-sHOWvbVQ",
    authDomain: "shoping-list-real.firebaseapp.com",
    databaseURL: "https://shoping-list-real-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "shoping-list-real",
    storageBucket: "shoping-list-real.appspot.com",
    messagingSenderId: "266818025489",
    appId: "1:266818025489:web:f1f1f057d92571bb1999b0",
    measurementId: "G-FKS4M2V6NV"
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export { db, ref, onValue, push, set, remove, update };
