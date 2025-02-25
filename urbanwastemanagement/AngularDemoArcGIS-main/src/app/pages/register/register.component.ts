import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private db: AngularFireDatabase, private router: Router) {}

  registerUser() {
    if (!this.email || !this.password) {
        this.errorMessage = 'Toate câmpurile sunt obligatorii!';
        return;
    }

    this.db.list('users').valueChanges().subscribe((users: any[]) => {
        const existingUser = users.find((user: any) => user.email === this.email);
        if (existingUser) {
            this.errorMessage = 'Email-ul este deja folosit!';
        } else {
            this.db.list('users').push({
                email: this.email,
                password: this.password, // Ar trebui criptată într-un proiect real
                role: 'customer',
                visits: 0,
                username: "",
                phone: ""
            }).then(() => {
                alert('Cont creat cu succes! Veți fi redirecționat către pagina de login.');
                this.router.navigate(['/login']);
            }).catch((error) => {
                this.errorMessage = `Eroare la înregistrare: ${error.message}`;
            });
        }
    });
}

}