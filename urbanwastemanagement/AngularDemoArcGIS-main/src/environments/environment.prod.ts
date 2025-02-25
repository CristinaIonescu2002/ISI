import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export const environment = {
  firebase: {
    apiKey: "AIzaSyDlLOeZcY-977iAj5QPoLRGl-dq_8LK9_w",
    authDomain: "urbanwastemanagement-a5342.firebaseapp.com",
    databaseURL: "https://urbanwastemanagement-a5342-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "urbanwastemanagement-a5342",
    storageBucket: "urbanwastemanagement-a5342.firebasestorage.app",
    messagingSenderId: "972289580650",
    appId: "1:972289580650:web:4c4cac6e0a9179eae63413",
    measurementId: "G-P320R3398G"
  },
  production: false
};
const app = initializeApp(environment.firebase);
const analytics = getAnalytics(app);