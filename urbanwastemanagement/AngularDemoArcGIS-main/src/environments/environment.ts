// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
