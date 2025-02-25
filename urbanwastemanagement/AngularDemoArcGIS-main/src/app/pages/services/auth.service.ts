import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Import necesar
import { User } from '../models/user.model'; // Importă modelul
import { BehaviorSubject, Observable, of } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})



export class AuthService {

  private currentUserSubject = new BehaviorSubject<any | null>(null);


  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router,

  ) {
    this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.db
            .object(`users/${user.uid}`)
            .valueChanges()
            .pipe(
              map((userData) => ({
                ...(user || {}), // Spread pe `user`, dacă este definit
                ...(typeof userData === 'object' && userData !== null ? userData : {}) // Verifică dacă `userData` este un obiect valid
              }))
            );
        } else {
          return of(null);
        }
      })
    ).subscribe((user) => {
      this.currentUserSubject.next(user);
    });
  }

  get currentUser(): Observable<any | null> {
    return this.currentUserSubject.asObservable();
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser.pipe(map((user) => !!user));
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  async getRole(uid: string): Promise<string | null> {
    try {
        const userRef = this.db.database.ref(`users/${uid}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();

        console.log('Data retrieved for role:', userData); // Debugging - afișează datele preluate

        return userData?.role || null;
    } catch (error) {
        console.error('Error retrieving user role:', error);
        return null;
    }
}


async getCurrentUser(): Promise<any | null> {
    try {
        const user = await this.afAuth.currentUser;
        console.log('Firebase Auth current user:', user); // Debugging
        return user;
    } catch (error) {
        console.error('Error retrieving current user:', error);
        return null;
    }
}

  

  register(email: string, password: string, role: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password).then((userCredential) => {
      const uid = userCredential.user?.uid;
      if (uid) {
        this.db.object(`users/${uid}`).set({ email, role });
      }
    });
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const snapshot = await this.db.database.ref('users').once('value');
      const users = snapshot.val();
  
      const user = Object.values(users).find((u: any) => u.email === email && u.password === password);
  
      if (user) {
        console.log('Autentificare reușită:', user);
        this.currentUserSubject.next(user); // Setăm utilizatorul curent
        return user;
      } else {
        throw new Error('Credentialele sunt invalide.');
      }
    } catch (error) {
      console.error('Eroare la autentificare:', error);
      throw error;
    }
  }
  

  logout(): void {
    this.afAuth.signOut();
    this.currentUserSubject.next(null);
  }

  

// async logout(): Promise<void> {
//     await this.afAuth.signOut();
//     console.log('Deconectat');
//   }
  
  private userRole = new BehaviorSubject<string | null>(null);



  getUserRole(uid: string): Promise<string | null> {
    return this.db.object<{ role: string }>(`users/${uid}`).valueChanges().toPromise().then(data => data?.role || null);
  }

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
    this.afAuth.authState.subscribe((authUser) => {
      console.log('Auth state change. User: ', authUser);
      if (authUser) {
        localStorage.setItem('user', JSON.stringify(authUser));
      } else {
        localStorage.removeItem('user');
      }
    });
  }

  updateUserData(email: string, data: Partial<User>): Promise<void> {
    return this.db.database
    .ref('users')
    .orderByChild('email')
    .equalTo(email)
    .once('value')
    .then((snapshot) => {
      const userKey = Object.keys(snapshot.val() || {})[0];
      if (userKey) {
        return this.db.object(`users/${userKey}`).update(data);
      } else {
        throw new Error('User not found');
      }
    })
    .catch((error) => {
      console.error('Error updating user by email:', error);
      throw error;
    });
  }
  
}